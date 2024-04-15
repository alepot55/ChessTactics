var indice = 0;
var soluzione = null;
var casellaCliccata = null;
var idScacchiera = 'scacchieraProblemi';
var partita = null;

var bottoneAggiorna = document.getElementById('aggiornaProblema');
var bottoneRisolvi = document.getElementById('risolviProblema');
var scacchieraProblemi = new Scacchiera(idScacchiera, DEFAULT_POSITION_WHITE, true, temaPezzi, temaScacchiera, convalidaMossaProblemi);

// Funzione che aggiorna la scacchiera con il problema ricevuto dal server
function aggiornaScacchieraProblemi(problema) {

    scacchieraProblemi.posizione(problema[1], false);

    // Aggiorna la soluzione del problema
    soluzione = problema[2];
    document.getElementById('soluzione').textContent = soluzione;

    // Fai la prima mossa
    let mossa = ottieniProssimaMossa();
    window.setTimeout(() => scacchieraProblemi.eseguiMossa(mossa), 700);
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
function convalidaMossaProblemi(mossa) {

    // Ottieni la mossa corretta
    let mossaCorretta = ottieniProssimaMossa(aggiorna = false).split(' ')[0];

    // Se la mossa è corretta eseguila
    if (mossa.slice(0, 2) + mossa.slice(2, 4) === mossaCorretta.slice(0, 4) && (mossaCorretta.length === 4 || mossaCorretta[4] === (mossa.length === 5 ? mossa[4] : null))) {
        risolvi();
        mossaGiusta();
        return true;
    } else {

        // Se la mossa è legale, allora è sbagliata
        mossaSbagliata();

        // Torna indietro
        return false
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
    scacchieraProblemi.eseguiMossa(mossa);

    // Se non ci sono più mosse da eseguire, mostra un messaggio
    if (soluzione.length === 0) {
        document.getElementById('descrizione').textContent = 'Prova il prossimo problema!';
        return bottoneRisolvi.disabled = true;
    }

    // Altrimenti esegui la mossa dell'avversario
    mossa = ottieniProssimaMossa();
    window.setTimeout(() => scacchieraProblemi.eseguiMossa(mossa), 700);
}

caricaProblema();
bottoneAggiorna.addEventListener('click', function () { caricaProblema(); });
bottoneRisolvi.addEventListener('click', function () { risolvi(); });
