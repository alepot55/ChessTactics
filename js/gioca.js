// le sezioni sono giocaComputer, giocaSolo, giocaRandom
// le scacchiere sono scacchieraComputer, scacchieraSolo, scacchieraRandom

DEFAULT_POSITION_WHITE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
DEFAULT_POSITION_BLACK = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'

// Variabili 
var sezioneCorrente = "giocaComputer";
var scacchieraCorrente = "scacchieraComputer";
var casellaCliccata = null;
var scacchieraGioca = null;
var partitaGioca = null;
var codicePartita = null;
var partitaInit = false;
var coloreUtente = null;

// Bottoni
var buttStopRicercaRandom = document.getElementById("stopRicercaRandom");
var buttNuovaPartitaRandom = document.getElementById("nuovaPartitaRandom");
var buttTerminaPartitaRandom = document.getElementById("terminaPartitaRandom");
var buttGiocaComputer = document.getElementById("giocaComputerButton");
var buttGiocaSolo = document.getElementById("giocaSoloButton");
var buttGiocaRandom = document.getElementById("giocaRandomButton");
var buttNuovaPartitaComputer = document.getElementById("nuovaPartitaComputer");
var buttNuovaPartitaSolo = document.getElementById("nuovaPartitaSolo");

// Imposta la casella cliccata (serve a gestire il click)
function setCasellaCliccata(casella) {
    casellaCliccata = casella;
}

// Restituisce la casella cliccata (serve a gestire il click)
function getCasellaCliccata() {
    return casellaCliccata;
}

// Imposta la posizione iniziale della scacchiera
function posizioneIniziale() {
    return coloreUtente === 'b' ? DEFAULT_POSITION_BLACK : DEFAULT_POSITION_WHITE;
}

// Aggiorna la scacchiera della sezione gioca
function aggiornaScacchieraGioca(scacchiera, posizione = DEFAULT_POSITION_WHITE) {

    // Imposta la partita
    partitaGioca = new Chess(posizione);

    // Imposta la scacchiera
    scacchieraGioca = new Chessboard2(scacchiera, {
        position: partitaGioca.fen(),
        draggable: false,
        trashSpeed: 'slow',
        orientation: coloreUtente === 'b' ? 'black' : 'white',
        pieceTheme: pieceTheme,
        onMouseenterSquare: onMouseEnterSquareGioca,
        onMousedownSquare: onMousedownSquareGioca,
    });

    // Applica il tema (non applicabile dalla configurazione)
    applicaTema(scacchiera)

    // Se inizia l'altro giocatore, aspetta la sua mossa
    if (coloreUtente === 'b') {
        let datiDaInviare = {
            operazione: 'aspettaMossa',
            codice: codicePartita
        };
        inviaMossaeAspetta(null, datiDaInviare, null);
    }
}

// Funzione per gestire il passaggio del mouse su una casella
function onMouseEnterSquareGioca(args) {
    if (sezioneCorrente === "giocaRandom" && coloreUtente !== partitaGioca.turn()) return;
    mostraSuggerimenti(args, partitaGioca, getCasellaCliccata, scacchieraCorrente);
}

// Funzione per gestire il click su una casella
function onMousedownSquareGioca(args) {
    if (sezioneCorrente === "giocaRandom" && scacchieraGioca.orientation().slice(0, 1) !== partitaGioca.turn()) return;
    gestisciClick(args, partitaGioca, scacchieraGioca, getCasellaCliccata, convalidaMossaGioca, setCasellaCliccata, scacchieraCorrente);
}

// Funzione per convalidare una mossa
function convalidaMossaGioca(args) {
    applicaTema(sezioneCorrente);

    // Calcola le mosse legali
    let mosseLegali = partitaGioca.moves({
        square: args['source'],
        verbose: true
    });
    // Se la mossa non è legale, non fare nulla
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) {
        return 'snapback';
    } else {
        rimuoviSuggerimenti();
        continuaMossa = sezioneCorrente === "giocaSolo" ? continuaMossaSolo : sezioneCorrente === "giocaComputer" ? continuaMossaComputer : continuaMossaRandom;
        continuaMossa(args);
    }

    applicaTema(sezioneCorrente);
}

// Funzione per proseguire la mossa nella sezione gioca da solo
function continuaMossaSolo(args) {

    // Esegue la mossa
    eseguiMossa(args['source'] + args['target'], partitaGioca, scacchieraGioca, scacchieraCorrente);

    // Se la partita è finita, mostra il messaggio corrispondente
    if (partitaGioca.game_over()) {
        document.getElementById("messaggioSolo").innerText = partitaGioca.in_checkmate() ? "Vince il " + (partitaGioca.turn() === 'w' ? "nero!" : "bianco!") : "Patta!";
    }

    // Aggiorna il turno
    //partitaGioca.orientation = partitaGioca.turn() === 'w' ? 'white' : 'black';
    //scacchieraGioca.orientation(partitaGioca.turn() === 'w' ? 'white' : 'black'); da errore

}

// Funzione per proseguire la mossa nella sezione gioca contro il computer
function continuaMossaComputer(args) {

    // Esegue la mossa
    eseguiMossa(args['source'] + args['target'], partitaGioca, scacchieraGioca);

    // Se la partita è finita, mostra il messaggio corrispondente
    if (partitaGioca.game_over()) {
        document.getElementById("messaggioComputer").innerText = partitaGioca.in_checkmate() ? "Hai vinto!" : "Patta!";
        return;
    }

    // Calcola la mossa del computer e la esegue
    let mossaComputer = getMossaComputer(partitaGioca);
    eseguiMossa(mossaComputer, partitaGioca, scacchieraGioca);

    // Se la partita è finita, mostra il messaggio corrispondente
    if (partitaGioca.game_over()) {
        document.getElementById("messaggioComputer").innerText = partitaGioca.in_checkmate() ? "Hai perso!" : "Patta!";
    }

}

// Funzione per proseguire la mossa nella sezione gioca random
function continuaMossaRandom(args) {

    // Esegue la mossa
    mossa = args['source'] + args['target'];
    eseguiMossa(mossa, partitaGioca, scacchieraGioca);

    // Invia la mossa al server e aspetta la mossa dell'avversario
    let datiDaInviare1 = {
        operazione: 'faiMossa',
        mossa: mossa,
        codice: codicePartita,
    }
    let datiDaInviare2 = {
        operazione: 'aspettaMossa',
        codice: codicePartita
    };
    inviaMossaeAspetta(datiDaInviare1, datiDaInviare2, mossa);

    // Se la partita è finita, mostra il messaggio corrispondente
    if (partitaGioca.game_over()) {
        aggiornaStatoRandom('terminata');
        document.getElementById("messaggioRandom").innerText = partitaGioca.in_checkmate() ? "Hai vinto!" : "Patta!";
        return;
    }

}

// Invia la mossa al server e aspetta la mossa dell'avversario
async function inviaMossaeAspetta(datiMossa, datiRichiesta, mossa) {

    // Se la mossa è null, invia solo la richiesta
    if (datiMossa !== null) await inviaDatiAlServer(datiMossa);

    // Invia la richiesta
    let datiRicevuti = await inviaDatiAlServer(datiRichiesta);

    // Se la partita è stata annullata, aggiorna lo stato
    if (datiRicevuti['annullata']) return aggiornaStatoRandom('annullata');

    // Se la mossa restituita è uguale a quella inviata, aspetta un secondo e ripeti
    if (datiRicevuti['mossa'] === mossa) return setTimeout(function () {
        inviaMossaeAspetta(null, datiRichiesta, mossa);
    }, 1000);

    // Altrimenti, esegui la mossa restituita
    eseguiMossa(datiRicevuti['mossa'], partitaGioca, scacchieraGioca);

    // Se la partita è finita, mostra il messaggio corrispondente
    if (partitaGioca.game_over()) {
        aggiornaStatoRandom('terminata');
        document.getElementById("messaggioRandom").innerText = partitaGioca.in_checkmate() ? "Hai perso!" : "Patta!";

        // Notifica il server della fine della partita
        let datiDaInviare = {
            operazione: 'finePartita',
            codice: codicePartita
        }
        await inviaDatiAlServer(datiDaInviare);
    }

}

async function aspettaGiocatori(datiPartita, datiRichiesta) {

    // Se la partita non è stata già iniziata
    if (datiPartita !== null) {

        // Invia i dati al server e ottieni il codice della partita
        let datiRicevuti = await inviaDatiAlServer(datiPartita);
        codicePartita = datiRicevuti['codice'];

        // Aggiorna il codice della partita e il colore dell'utente
        datiRichiesta['codice'] = datiRicevuti['codice'];
        coloreUtente = datiRicevuti['colore'];

        // Se la partita è iniziata, aggiorna lo stato
        partitaInit = datiRicevuti['iniziata'];
        aggiornaStatoRandom(partitaInit ? 'iniziata' : 'ricerca');
    }

    // Invia la richiesta al server e aspetta la risposta
    let datiRicevuti = await inviaDatiAlServer(datiRichiesta);

    // Se la partita è stata annullata, aggiorna lo stato
    if (datiRicevuti['annullata']) return aggiornaStatoRandom('annullata');

    // Se la partita è iniziata, aggiorna lo stato e la scacchiera
    if (partitaInit || datiRicevuti['iniziata']) {
        aggiornaStatoRandom('iniziata');
        return aggiornaScacchieraGioca(scacchieraCorrente);
    }

    // Altrimenti, aspetta un secondo e ripeti
    setTimeout(function () {
        aspettaGiocatori(null, datiRichiesta);
    }, 1000);
}

// Funzione per creare una partita e aspettare i giocatori
function creaPartitaeAspetta(protezione) {

    // Inizializza i dati della partita e della richiesta
    let datiPartita = {
        operazione: 'creaPartita',
        username: nomeUtente,
        protezione: protezione
    }
    let datiRichiesta = {
        operazione: 'aspettaGiocatori',
        username: nomeUtente,
        codice: codicePartita
    }

    // Aspetta i giocatori e aggiorna lo stato
    aspettaGiocatori(datiPartita, datiRichiesta);
    aggiornaStatoRandom('ricerca');
}

// Funzione per ottenere la mossa del computer
function getMossaComputer(partita) {

    // Ottiene le mosse legali 
    let mosse = partita.moves({
        verbose: true
    });

    // Sceglie una mossa a caso
    let mossa = mosse[Math.floor(Math.random() * mosse.length)];
    return mossa.from + mossa.to;
}

// Mostra la modalità di gioco selezionata
function mostraGioca(sezione) {

    // Nasconde tutti i bottoni
    document.getElementById("giocaComputer").style.display = "none";
    document.getElementById("giocaSolo").style.display = "none";
    document.getElementById("giocaRandom").style.display = "none";

    // Mostra la sezione selezionata e imposta la sezione corrente
    document.getElementById(sezione).style.display = "block";
    sezioneCorrente = sezione;
    scacchieraCorrente = sezioneCorrente === "giocaComputer" ? "scacchieraComputer" : sezioneCorrente === "giocaSolo" ? "scacchieraSolo" : "scacchieraRandom";

    // Se la sezione è random, aggiorna lo stato senza cambiare la scacchiera
    if (sezioneCorrente === "giocaRandom") return aggiornaStatoRandom('default');

    // Aggiorna la scacchiera
    aggiornaScacchieraGioca(scacchieraCorrente)
}

// Aggiorna lo stato della partita random
function aggiornaStatoRandom(stato = 'default') {
    switch (stato) {
        case 'default':
            scacchieraGioca = Chessboard2(scacchieraCorrente)
            partitaGioca = Chess();
            applicaTema(sezioneCorrente)
            document.getElementById("messaggioRandom").innerText = "Benvenuto nella sezione random! Clicca su 'Nuova Partita' per iniziare! Puoi giocare con un avversario casuale o con un amico inserendo un codice!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            buttStopRicercaRandom.style.display = "none";
            document.getElementById("codiceRandom").value = "";
            buttTerminaPartitaRandom.style.display = "none";
            buttNuovaPartitaRandom.style.display = "block";
            break;
        case 'iniziata':
            document.getElementById("messaggioRandom").innerText = "Partita iniziata!";
            partitaInit = true;
            document.getElementById("codiceRandom").value = "";
            buttNuovaPartitaRandom.style.display = "none";
            buttTerminaPartitaRandom.style.display = "block";
            buttStopRicercaRandom.style.display = "none";
            break;
        case 'terminata':
            document.getElementById("messaggioRandom").innerText = "Partita terminata!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            document.getElementById("codiceRandom").value = "";
            buttStopRicercaRandom.style.display = "none";
            buttTerminaPartitaRandom.style.display = "none";
            buttNuovaPartitaRandom.style.display = "block";
            break;
        case 'annullata':
            document.getElementById("messaggioRandom").innerText = "Partita annullata!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            document.getElementById("codiceRandom").value = "";
            buttStopRicercaRandom.style.display = "none";
            buttTerminaPartitaRandom.style.display = "none";
            buttNuovaPartitaRandom.style.display = "block";
            break;
        case 'ricerca':
            scacchieraGioca = Chessboard2(scacchieraCorrente)
            partitaGioca = Chess();
            document.getElementById("messaggioRandom").innerText = "In attesa di un avversario...";
            buttNuovaPartitaRandom.style.display = "none";
            buttTerminaPartitaRandom.style.display = "none";
            buttStopRicercaRandom.style.display = "block";
            break;
        default:
            break;
    }
}

mostraGioca("giocaComputer");
buttStopRicercaRandom.style.display = "none";
buttGiocaComputer.addEventListener("click", function () {
    mostraGioca("giocaComputer");
});
buttGiocaSolo.addEventListener("click", function () {
    mostraGioca("giocaSolo");
});
buttGiocaRandom.addEventListener("click", function () {
    mostraGioca("giocaRandom");
});
buttStopRicercaRandom.addEventListener("click", function () {
    let datiDaInviare = {
        operazione: 'annullaPartita',
        username: nomeUtente,
        codice: codicePartita
    }
    inviaDatiAlServer(datiDaInviare);
});
buttNuovaPartitaRandom.addEventListener("click", function () {
    if (partitaInit) {
        document.getElementById("messaggioRandom").innerText = "Devi terminare la partita in corso!";
        return;
    }

    let protezione = document.getElementById("codiceRandom").value;

    if (protezione.length === 0) {
        protezione = null;
    }

    if (nomeUtente === null || nomeUtente === "") {
        document.getElementById("messaggioRandom").innerText = "Devi essere loggato per giocare!";
        return;
    }
    return creaPartitaeAspetta(protezione);
});
buttTerminaPartitaRandom.addEventListener("click", function () {
    let datiDaInviare = {
        operazione: 'finePartita',
        codice: codicePartita
    }
    inviaDatiAlServer(datiDaInviare);
    aggiornaStatoRandom('terminata');
});
buttNuovaPartitaComputer.addEventListener("click", function () { 
    mostraGioca("giocaComputer"); 
});
buttNuovaPartitaSolo.addEventListener("click", function () { 
    mostraGioca("giocaSolo"); 
});