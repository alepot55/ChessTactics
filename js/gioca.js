// le sezioni sono giocaComputer, giocaSolo, giocaMultiplayer
// le scacchiere sono scacchieraComputer, scacchieraSolo, scacchieraMultiplayer

DEFAULT_POSITION_WHITE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
DEFAULT_POSITION_BLACK = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'

// Variabili 
var sezioneCorrente = "giocaComputer";
var idScacchieraCorrente = "scacchieraComputer";
var modalitàMultiplayer = 'normale';
var casellaCliccata = null;
var scacchieraGioca = null;
var partitaGioca = null;
var codicePartita = null;
var partitaInit = false;
var coloreUtente = null;

// Bottoni
var buttStopRicercaMultiplayer = document.getElementById("stopRicercaMultiplayer");
var buttNuovaPartitaMultiplayer = document.getElementById("nuovaPartitaMultiplayer");
var buttTerminaPartitaMultiplayer = document.getElementById("terminaPartitaMultiplayer");
var buttGiocaComputer = document.getElementById("giocaComputerButton");
var buttGiocaSolo = document.getElementById("giocaSoloButton");
var buttGiocaMultiplayer = document.getElementById("giocaMultiplayerButton");
var buttNuovaPartitaComputer = document.getElementById("nuovaPartitaComputer");
var buttNuovaPartitaSolo = document.getElementById("nuovaPartitaSolo");

function applicaTemaMultiplayer() {
    let tema = modalitàMultiplayer === 'pezziNascosti' ? 'dama' : temaPezzi;
    applicaTema(idScacchieraCorrente, tema);
    if (modalitàMultiplayer === 'nebbia' && partitaInit) annebbiaScacchiera();
}

function cambiaTurnoFen(fen) {
    let parti = fen.split(" ");
    parti[1] = parti[1] === 'w' ? 'b' : 'w';
    parti[3] = '-';
    return parti.join(" ");
}

// Funzione per annebbiare la scacchiera
function annebbiaScacchiera() {
    let fen = partitaGioca.fen();
    if (partitaGioca.turn() !== coloreUtente) fen = cambiaTurnoFen(fen);
    let partitaVisualizza = new Chess(fen);

    let coloreAvversario = coloreUtente === 'w' ? 'b' : 'w';
    let caselleAccessibili = [];
    let mosse = partitaVisualizza.moves({ verbose: true });
    for (var i = 0; i < mosse.length; i++) {
        caselleAccessibili.push(mosse[i].to);
    }
    let caselle = document.querySelectorAll(`#${idScacchieraCorrente} [data-square-coord]`);
    for (var i = 0; i < caselle.length; i++) {
        let casella = caselle[i].getAttribute('data-square-coord');
        if (!caselleAccessibili.includes(casella)) {
            if (partitaVisualizza.get(casella) === null) caselle[i].style.backgroundColor = "#222222";
            else if (partitaVisualizza.get(casella)['color'] === coloreAvversario) {
                caselle[i].style.backgroundColor = "#222222";
                partitaVisualizza.remove(casella);
            }
        }
    }

    scacchieraGioca.position(partitaVisualizza.fen());
}

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
    applicaTemaMultiplayer();

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
    if (sezioneCorrente === "giocaMultiplayer" && coloreUtente !== partitaGioca.turn() || modalitàMultiplayer !== 'normale') return;
    mostraSuggerimenti(args, partitaGioca, getCasellaCliccata, idScacchieraCorrente);
}

// Funzione per gestire il click su una casella
function onMousedownSquareGioca(args) {
    if (sezioneCorrente === "giocaMultiplayer" && scacchieraGioca.orientation().slice(0, 1) !== partitaGioca.turn()) return;

    gestisciClick(args, partitaGioca, getCasellaCliccata, convalidaMossaGioca, setCasellaCliccata, idScacchieraCorrente, modalitàMultiplayer === 'normale');
}

// Funzione per convalidare una mossa
function convalidaMossaGioca(args) {
    // Calcola le mosse legali
    let mosseLegali = partitaGioca.moves({
        square: args['source'],
        verbose: true
    });
    // Se la mossa non è legale, non fare nulla
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) {
        return 'snapback';
    } else {
        continuaMossa = sezioneCorrente === "giocaSolo" ? continuaMossaSolo : sezioneCorrente === "giocaComputer" ? continuaMossaComputer : continuaMossaMultiplayer;
        continuaMossa(args);
        applicaTemaMultiplayer();
    }
}

// Funzione per proseguire la mossa nella sezione gioca da solo
function continuaMossaSolo(args) {

    // Esegue la mossa
    eseguiMossa(args['source'] + args['target'], partitaGioca, scacchieraGioca);

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

// Funzione per proseguire la mossa nella sezione gioca Multiplayer
function continuaMossaMultiplayer(args) {

    // Esegue la mossa e applica il tema
    mossa = args['source'] + args['target'];
    eseguiMossa(mossa, partitaGioca, scacchieraGioca);
    applicaTemaMultiplayer();

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
        aggiornaStatoMultiplayer('terminata');
        document.getElementById("messaggioMultiplayer").innerText = partitaGioca.in_checkmate() ? "Hai vinto!" : "Patta!";
        return;
    }

}

// Invia la mossa al server e aspetta la mossa dell'avversario
async function inviaMossaeAspetta(datiMossa, datiRichiesta, mossa) {

    // Se la mossa è null, invia solo la richiesta
    if (datiMossa !== null) {
        await inviaDatiAlServer(datiMossa);
        aggiornaStatoMultiplayer('turnoAvversario');
    }

    // Invia la richiesta
    let datiRicevuti = await inviaDatiAlServer(datiRichiesta);

    // Se la partita è stata annullata, aggiorna lo stato
    if (datiRicevuti['annullata']) return aggiornaStatoMultiplayer('annullata');

    // Se la mossa restituita è uguale a quella inviata, aspetta un secondo e ripeti
    if (datiRicevuti['mossa'] === mossa) return setTimeout(function () {
        inviaMossaeAspetta(null, datiRichiesta, mossa);
    }, 1000);

    // Altrimenti, esegui la mossa restituita
    eseguiMossa(datiRicevuti['mossa'], partitaGioca, scacchieraGioca);
    applicaTemaMultiplayer();
    aggiornaStatoMultiplayer('mioTurno');

    // Se la partita è finita, mostra il messaggio corrispondente
    if (partitaGioca.game_over()) {
        aggiornaStatoMultiplayer('terminata');
        document.getElementById("messaggioMultiplayer").innerText = partitaGioca.in_checkmate() ? "Hai perso!" : "Patta!";

        // Notifica il server della fine della partita
        let datiDaInviare = {
            operazione: 'finePartita',
            codice: codicePartita
        }
        await inviaDatiAlServer(datiDaInviare);
    }

}

// Funzione per aspettare che i giocatori si uniscano alla partita
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
        aggiornaStatoMultiplayer(partitaInit ? 'iniziata' : 'ricerca');
    }

    // Invia la richiesta al server e aspetta la risposta
    let datiRicevuti = await inviaDatiAlServer(datiRichiesta);

    // Se la partita è stata annullata, aggiorna lo stato
    if (datiRicevuti['annullata']) return aggiornaStatoMultiplayer('annullata');

    // Se la partita è iniziata, aggiorna lo stato e la scacchiera
    if (partitaInit || datiRicevuti['iniziata']) {
        aggiornaStatoMultiplayer('iniziata');
        return aggiornaScacchieraGioca(idScacchieraCorrente);
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
    aggiornaStatoMultiplayer('ricerca');
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
    document.getElementById("giocaMultiplayer").style.display = "none";

    // Mostra la sezione selezionata e imposta la sezione corrente
    document.getElementById(sezione).style.display = "block";
    sezioneCorrente = sezione;
    idScacchieraCorrente = sezioneCorrente === "giocaComputer" ? "scacchieraComputer" : sezioneCorrente === "giocaSolo" ? "scacchieraSolo" : "scacchieraMultiplayer";

    // Se la sezione è Multiplayer, aggiorna lo stato senza cambiare la scacchiera
    if (sezioneCorrente === "giocaMultiplayer") return aggiornaStatoMultiplayer('default');

    // Aggiorna la scacchiera
    aggiornaScacchieraGioca(idScacchieraCorrente)
}

// Aggiorna lo stato della partita Multiplayer
function aggiornaStatoMultiplayer(stato = 'default') {
    switch (stato) {
        case 'default':
            scacchieraGioca = Chessboard2(idScacchieraCorrente)
            partitaGioca = Chess();
            applicaTemaMultiplayer();
            document.getElementById("messaggioMultiplayer").innerText = "Benvenuto nella sezione Multiplayer! Clicca su 'Nuova Partita' per iniziare! Puoi giocare con un avversario casuale o con un amico inserendo un codice!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            buttStopRicercaMultiplayer.style.display = "none";
            document.getElementById("codiceMultiplayer").value = "";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttNuovaPartitaMultiplayer.style.display = "block";
            break;
        case 'iniziata':
            document.getElementById("messaggioMultiplayer").innerText = "Partita iniziata!";
            partitaInit = true;
            document.getElementById("codiceMultiplayer").value = "";
            buttNuovaPartitaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "block";
            buttStopRicercaMultiplayer.style.display = "none";
            break;
        case 'terminata':
            document.getElementById("messaggioMultiplayer").innerText = "Partita terminata!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            document.getElementById("codiceMultiplayer").value = "";
            buttStopRicercaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttNuovaPartitaMultiplayer.style.display = "block";
            break;
        case 'annullata':
            document.getElementById("messaggioMultiplayer").innerText = "Partita annullata!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            document.getElementById("codiceMultiplayer").value = "";
            buttStopRicercaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttNuovaPartitaMultiplayer.style.display = "block";
            break;
        case 'ricerca':
            scacchieraGioca = Chessboard2(idScacchieraCorrente)
            partitaGioca = Chess();
            applicaTemaMultiplayer();
            document.getElementById("messaggioMultiplayer").innerText = "In attesa di un avversario...";
            buttNuovaPartitaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttStopRicercaMultiplayer.style.display = "block";
            break;
        case 'mioTurno':
            document.getElementById("messaggioMultiplayer").innerText = "Il tuo turno!";
            break;
        case 'turnoAvversario':
            document.getElementById("messaggioMultiplayer").innerText = "Turno dell'avversario...";
            break;
        default:
            break;
    }
}

mostraGioca("giocaComputer");
buttStopRicercaMultiplayer.style.display = "none";
buttGiocaComputer.addEventListener("click", function () {
    mostraGioca("giocaComputer");
});
buttGiocaSolo.addEventListener("click", function () {
    mostraGioca("giocaSolo");
});
buttGiocaMultiplayer.addEventListener("click", function () {
    mostraGioca("giocaMultiplayer");
});
buttStopRicercaMultiplayer.addEventListener("click", function () {
    let datiDaInviare = {
        operazione: 'annullaPartita',
        username: nomeUtente,
        codice: codicePartita
    }
    inviaDatiAlServer(datiDaInviare);
});
buttNuovaPartitaMultiplayer.addEventListener("click", function () {

    // Prende i dati inseriti dall'utente
    modalitàMultiplayer = document.getElementById("modalitàMultiplayer").value;
    let password = document.getElementById("codiceMultiplayer").value;

    // Se non è loggato, mostra un messaggio
    if (nomeUtente === null) {
        document.getElementById("messaggioMultiplayer").innerText = "Devi essere loggato per giocare!";
        return;
    }

    // Crea la partita e aspetta i giocatori
    return creaPartitaeAspetta(modalitàMultiplayer + password);
});
buttTerminaPartitaMultiplayer.addEventListener("click", function () {
    let datiDaInviare = {
        operazione: 'finePartita',
        codice: codicePartita
    }
    inviaDatiAlServer(datiDaInviare);
    aggiornaStatoMultiplayer('terminata');
});
buttNuovaPartitaComputer.addEventListener("click", function () {
    mostraGioca("giocaComputer");
});
buttNuovaPartitaSolo.addEventListener("click", function () {
    mostraGioca("giocaSolo");
});