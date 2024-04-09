// le sezioni sono giocaComputer, giocaSolo, giocaRandom
// le scacchiere sono scacchieraComputer, scacchieraSolo, scacchieraRandom

var sezioneCorrente = "giocaComputer";
var scacchieraCorrente = "scacchieraComputer";
var casellaCliccata = null;
DEFAULT_POSITION_WHITE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
DEFAULT_POSITION_BLACK = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'
var scacchieraGioca = null;
var partitaGioca = null;
var codicePartita = null;
var partitaInit = false;
var coloreUtente = null;

function setCasellaCliccata(casella) {
    casellaCliccata = casella;
}

function getCasellaCliccata() {
    return casellaCliccata;
}

function posizioneIniziale() {
    return coloreUtente === 'b' ? DEFAULT_POSITION_BLACK : DEFAULT_POSITION_WHITE;
}

function aggiornaScacchieraGioca(scacchiera, posizione = DEFAULT_POSITION_WHITE) {
    partitaGioca = new Chess(posizione);
    onDropGioca = scacchiera === "scacchieraComputer" ? onDropComputer : scacchiera === "scacchieraSolo" ? onDropSolo : onDropRandom;
    scacchieraGioca = new Chessboard2(scacchiera, {
        position: partitaGioca.fen(),
        draggable: false,
        trashSpeed: 'slow',
        orientation: coloreUtente === 'b' ? 'black' : 'white',
        pieceTheme: pieceTheme,
        onDragStart: onDragStartGioca,
        onMouseenterSquare: onMouseEnterSquareGioca,
        onMousedownSquare: onMousedownSquareGioca,
        onDrop: onDropGioca,
    });
    applicaTema()
    if (coloreUtente === 'b') {
        let datiDaInviare = {
            operazione: 'aspettaMossa',
            codice: codicePartita
        };
        inviaMossaeAspetta(null, datiDaInviare, null);
    }
}

function onDragStartGioca(args) {
    return bloccaMossa(args['piece'], partitaGioca);
}

function onMouseEnterSquareGioca(args) {
    if (sezioneCorrente === "giocaRandom" && coloreUtente !== partitaGioca.turn()) return;
    mostraSuggerimenti(args, partitaGioca, getCasellaCliccata, scacchieraCorrente);
}

function onMousedownSquareGioca(args) {
    applicaTema();
    if (sezioneCorrente === "giocaRandom" && scacchieraGioca.orientation().slice(0, 1) !== partitaGioca.turn()) return;
    gestisciClick(args, partitaGioca, scacchieraGioca, getCasellaCliccata, onDropGioca, setCasellaCliccata, scacchieraCorrente);
}

function onDropSolo(args) {
    applicaTema();
    let mosseLegali = partitaGioca.moves({
        square: args['source'],
        verbose: true
    });
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) {
        return 'snapback';
    } else {
        rimuoviSuggerimenti()
        eseguiMossa(args['source'] + args['target'], partitaGioca, scacchieraGioca);
        if (partitaGioca.game_over()) {
            document.getElementById("messaggioSolo").innerText = partitaGioca.in_checkmate() ? "Vince il " + (partitaGioca.turn() === 'w' ? "nero!" : "bianco!") : "Patta!";
        }
        //partitaGioca.orientation = partitaGioca.turn() === 'w' ? 'white' : 'black';
        //scacchieraGioca.orientation(partitaGioca.turn() === 'w' ? 'white' : 'black'); da errore
    }
}

function onDropComputer(args) {
    applicaTema();
    let mosseLegali = partitaGioca.moves({
        square: args['source'],
        verbose: true
    });
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) {
        return 'snapback';
    } else {
        rimuoviSuggerimenti()
        eseguiMossa(args['source'] + args['target'], partitaGioca, scacchieraGioca);
        if (partitaGioca.game_over()) {
            document.getElementById("messaggioComputer").innerText = partitaGioca.in_checkmate() ? "Hai vinto!" : "Patta!";
            return;
        }
        let mossaComputer = getMossaComputer(partitaGioca);
        eseguiMossa(mossaComputer, partitaGioca, scacchieraGioca);
        if (partitaGioca.game_over()) {
            document.getElementById("messaggioComputer").innerText = partitaGioca.in_checkmate() ? "Hai perso!" : "Patta!";
        }
    }
}

function onDropRandom(args) {
    applicaTema();
    let mosseLegali = partitaGioca.moves({
        square: args['source'],
        verbose: true
    });
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target']) || scacchieraGioca.orientation().slice(0, 1) !== partitaGioca.turn() || partitaGioca === null) {
        return 'snapback';
    } else {
        rimuoviSuggerimenti()

        mossa = args['source'] + args['target'];
        eseguiMossa(mossa, partitaGioca, scacchieraGioca);

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

        if (partitaGioca.game_over()) {
            aggiornaStatoRandom('terminata');
            document.getElementById("messaggioRandom").innerText = partitaGioca.in_checkmate() ? "Hai vinto!" : "Patta!";
            return;
        }
    }
}

async function inviaMossaeAspetta(dati1, dati2, mossa) {
    if (dati1 !== null) {
        await inviaDatiAlServer(dati1);
    }
    let datiRicevuti = await inviaDatiAlServer(dati2);
    if (datiRicevuti['annullata']) {
        aggiornaStatoRandom('annullata');
        return;
    }
    if (datiRicevuti['mossa'] === mossa) {
        setTimeout(function () {
            inviaMossaeAspetta(null, dati2, mossa);
        }, 1000);
    } else {
        eseguiMossa(datiRicevuti['mossa'], partitaGioca, scacchieraGioca);
        if (partitaGioca.game_over()) {
            aggiornaStatoRandom('terminata');
            document.getElementById("messaggioRandom").innerText = partitaGioca.in_checkmate() ? "Hai perso!" : "Patta!";
            let datiDaInviare = {
                operazione: 'finePartita',
                codice: codicePartita
            }
            await inviaDatiAlServer(datiDaInviare);
        }
    }
}

async function aspettaGiocatori(dati1, dati2) {
    let iniziata = false;
    if (dati1 !== null) {
        let datiRicevuti = await inviaDatiAlServer(dati1);
        codicePartita = datiRicevuti['codice'];
        dati2['codice'] = datiRicevuti['codice'];
        coloreUtente = datiRicevuti['colore'];
        iniziata = datiRicevuti['iniziata'];
        aggiornaStatoRandom(iniziata ? 'iniziata' : 'ricerca');
    }
    let datiRicevuti = await inviaDatiAlServer(dati2);
    if (datiRicevuti['annullata']) {
        aggiornaStatoRandom('annullata');
        return;
    }
    if (iniziata || datiRicevuti['iniziata']) {
        aggiornaStatoRandom('iniziata');
        aggiornaScacchieraGioca(scacchieraCorrente)
    } else {
        setTimeout(function () {
            aspettaGiocatori(null, dati2);
        }, 1000);
    }
}

function creaPartitaeAspetta(protezione) {
    let datiDaInviare1 = {
        operazione: 'creaPartita',
        username: nomeUtente,
        protezione: protezione
    }
    let datiDaInviare2 = {
        operazione: 'aspettaGiocatori',
        username: nomeUtente,
        codice: codicePartita
    }
    aspettaGiocatori(datiDaInviare1, datiDaInviare2);
    aggiornaStatoRandom('ricerca');
}

function getMossaComputer(partita) {
    let mosse = partita.moves({
        verbose: true
    });
    let mossa = mosse[Math.floor(Math.random() * mosse.length)];
    return mossa.from + mossa.to;
}

function mostraGioca(sezione) {
    document.getElementById("giocaComputer").style.display = "none";
    document.getElementById("giocaSolo").style.display = "none";
    document.getElementById("giocaRandom").style.display = "none";

    document.getElementById(sezione).style.display = "block";
    scacchieraCorrente = sezione === "giocaComputer" ? "scacchieraComputer" : sezione === "giocaSolo" ? "scacchieraSolo" : "scacchieraRandom";
    sezioneCorrente = sezione;

    if (sezione === "giocaRandom") {
        aggiornaStatoRandom();
        return;
    }
    aggiornaScacchieraGioca(scacchieraCorrente)
}

function aggiornaStatoRandom(stato = 'default') {
    applicaTema()
    if (stato === 'default') {
        scacchieraGioca = Chessboard2(scacchieraCorrente)
        partitaGioca = Chess();
        document.getElementById("messaggioRandom").innerText = "Benvenuto nella sezione random! Clicca su 'Nuova Partita' per iniziare! Puoi giocare con un avversario casuale o con un amico inserendo un codice!";
        partitaInit = false;
        codicePartita = null;
        coloreUtente = null;
        document.getElementById("stopRicercaRandom").style.display = "none";
        document.getElementById("codiceRandom").value = "";
        document.getElementById("terminaPartitaRandom").style.display = "none";
        document.getElementById("nuovaPartitaRandom").style.display = "block";
    } else if (stato === 'iniziata') {
        document.getElementById("messaggioRandom").innerText = "Partita iniziata!";
        partitaInit = true;
        document.getElementById("codiceRandom").value = "";
        document.getElementById("nuovaPartitaRandom").style.display = "none";
        document.getElementById("terminaPartitaRandom").style.display = "block";
        document.getElementById("stopRicercaRandom").style.display = "none";
    } else if (stato === 'terminata') {
        document.getElementById("messaggioRandom").innerText = "Partita terminata!";
        partitaInit = false;
        codicePartita = null;
        coloreUtente = null;
        document.getElementById("codiceRandom").value = "";
        document.getElementById("stopRicercaRandom").style.display = "none";
        document.getElementById("terminaPartitaRandom").style.display = "none";
        document.getElementById("nuovaPartitaRandom").style.display = "block";
    } else if (stato === 'annullata') {
        document.getElementById("messaggioRandom").innerText = "Partita annullata!";
        partitaInit = false;
        codicePartita = null;
        coloreUtente = null;
        document.getElementById("codiceRandom").value = "";
        document.getElementById("stopRicercaRandom").style.display = "none";
        document.getElementById("terminaPartitaRandom").style.display = "none";
        document.getElementById("nuovaPartitaRandom").style.display = "block";
    } else if (stato === 'ricerca') {
        scacchieraGioca = Chessboard2(scacchieraCorrente)
        partitaGioca = Chess();
        document.getElementById("messaggioRandom").innerText = "In attesa di un avversario...";
        document.getElementById("nuovaPartitaRandom").style.display = "none";
        document.getElementById("terminaPartitaRandom").style.display = "none";
        document.getElementById("stopRicercaRandom").style.display = "block";
    }
}

mostraGioca("giocaComputer");
document.getElementById("stopRicercaRandom").style.display = "none";
document.getElementById("giocaComputerButton").addEventListener("click", function () {
    mostraGioca("giocaComputer");
});
document.getElementById("giocaSoloButton").addEventListener("click", function () {
    mostraGioca("giocaSolo");
});
document.getElementById("giocaRandomButton").addEventListener("click", function () {
    mostraGioca("giocaRandom");
});
document.getElementById("stopRicercaRandom").addEventListener("click", function () {
    let datiDaInviare = {
        operazione: 'annullaPartita',
        username: nomeUtente,
        codice: codicePartita
    }
    inviaDatiAlServer(datiDaInviare);
});
document.getElementById("nuovaPartitaRandom").addEventListener("click", function () {
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
document.getElementById("terminaPartitaRandom").addEventListener("click", function () {
    let datiDaInviare = {
        operazione: 'finePartita',
        codice: codicePartita
    }
    inviaDatiAlServer(datiDaInviare);
    aggiornaStatoRandom('terminata');
});
document.getElementById("nuovaPartitaComputer").addEventListener("click", function () { mostraGioca("giocaComputer"); });
document.getElementById("nuovaPartitaSolo").addEventListener("click", function () { mostraGioca("giocaSolo"); });