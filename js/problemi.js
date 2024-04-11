var indice = 0;
var soluzione = null;
var casellaCliccata = null;
var idScacchiera = 'scacchieraProblemi';
var partita = null;

var scacchiera = Chessboard2(idScacchiera, 'start');
var bottoneAggiorna = document.getElementById('aggiornaProblema');
var bottoneRisolvi = document.getElementById('risolviProblema');

// Funzione che aggiorna la scacchiera con il problema ricevuto dal server
function aggiornaScacchieraProblemi(problema) {

    // Inizializza la partita 
    partita = new Chess(problema[1]);

    // Configura la scacchiera
    let configurazione = {
        draggable: false,
        position: partita.fen(),
        orientation: partita.turn() === 'w' ? 'black' : 'white',
        trashSpeed: 'slow',
        onMouseenterSquare: onMouseEnterSquareProblemi,
        onMousedownSquare: onMousedownSquareProblemi,
    }
    scacchiera = new Chessboard2(idScacchiera, configurazione);

    // Aggiorna la soluzione del problema
    soluzione = problema[2];
    document.getElementById('soluzione').textContent = soluzione;

    // Fai la prima mossa
    let mossa = ottieniProssimaMossa();
    window.setTimeout(() => eseguiMossa(mossa, partita, scacchiera), 700);

    // Imposta il tema e la casella cliccata
    setCasellaCliccata(null)
    applicaTema();
}

// Imposta la casella cliccata (serve a gestire il click)
function setCasellaCliccata(casella) {
    casellaCliccata = casella;
}

// Restituisce la casella cliccata (serve a gestire il click)
function getCasellaCliccata() {
    return casellaCliccata;
}

// Funzione che gestisce il passaggio del mouse su una casella
function onMouseEnterSquareProblemi(args) {
    mostraSuggerimenti(args, partita, getCasellaCliccata, idScacchiera);
}

// Funzione che gestisce il click su una casella
function onMousedownSquareProblemi(args) {
    if (soluzione.length === 0) return;
    gestisciClick(args, partita, scacchiera, getCasellaCliccata, convalidaMossaProblemi, setCasellaCliccata, idScacchiera);
}

// Funzione che restituisce la prossima mossa da eseguire
function ottieniProssimaMossa(aggiorna = true) {
    let mossa = soluzione.split(' ')[0];
    if (aggiorna) soluzione = soluzione.slice(mossa.length + 1);
    return mossa;
}

// Carica il problema successivo e aggiorna la scacchiera
async function caricaProblema() {

    // Invia la richiesta al server per ottenere il problema
    let datiDaInviare = {
        operazione: 'problema',
        indice: indice
    }
    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    // Aggiorna la scacchiera con il problema ricevuto
    aggiornaScacchieraProblemi(datiRicevuti['problema']);

    // Aggiorna l'indice del problema
    indice++;

    // Abilita il bottone risolvi e aggiorna il testo
    bottoneRisolvi.disabled = false;
    document.getElementById('descrizione').textContent = 'Risolvi il problema!';
}

// Funzione che convalida la mossa inserita dall'utente
function convalidaMossaProblemi(args) {

    // Ottieni la mossa corretta
    let mossaCorretta = ottieniProssimaMossa(aggiorna = false).slice(0, 4);

    // Ottieni le mosse legali
    let mosseLegali = partita.moves({
        square: args['source'],
        verbose: true
    });

    // Se la mossa è corretta eseguila
    if (args['source'] + args['target'] === mossaCorretta) {
        rimuoviSuggerimenti();
        risolvi();
        mossaGiusta();
    } else {

        // Se la mossa è legale, allora è sbagliata
        if (mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) mossaSbagliata();

        // Torna indietro
        return 'snapback'
    }
}

// Funzione per quando l'utente esegue una mossa sbagliata
function mossaSbagliata() {
    document.getElementById('descrizione').textContent = 'Mossa errata!';
}

// Funzione per quando l'utente completa il puzzle
function vittoria() {
    document.getElementById('descrizione').textContent = 'Complimenti hai completato il puzzle!';
}

// Funzione per quando l'utente esegue una mossa corretta
function mossaGiusta() {

    // Aggiorna il punteggio dell'utente
    punteggioUtente = punteggioUtente + 1;
    aggiornaProfilo()

    // Se non ci sono più mosse da eseguire, l'utente ha completato il puzzle
    if (soluzione.length === 0) {
        return vittoria()
    }

    // Altrimenti mostra un messaggio di conferma
    document.getElementById('descrizione').textContent = 'Esatto, continua così!';
    
}

// Funzione che risolve una mossa del problema
function risolvi() {

    // Prendi la prossima mossa e eseguila
    let mossa = ottieniProssimaMossa();
    eseguiMossa(mossa, partita, scacchiera, idScacchiera);

    // Se non ci sono più mosse da eseguire, mostra un messaggio
    if (soluzione.length === 0) {
        document.getElementById('descrizione').textContent = 'Prova il prossimo problema!';
        return bottoneRisolvi.disabled = true;
    }

    // Altrimenti esegui la mossa dell'avversario
    mossa = ottieniProssimaMossa();
    window.setTimeout(() => eseguiMossa(mossa, partita, scacchiera), 700);
}

caricaProblema();
bottoneAggiorna.addEventListener('click', function () { caricaProblema(); });
bottoneRisolvi.addEventListener('click', function () { risolvi(); });
