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

function aggiornaScacchieraGioca(scacchiera, posizione = DEFAULT_POSITION_WHITE) {
    partitaGioca = new Chess(posizione);
    onDropGioca = scacchiera === "scacchieraComputer" ? onDropComputer : scacchiera === "scacchieraSolo" ? onDropSolo : onDropRandom;
    scacchieraGioca = new Chessboard2(scacchiera, {
        position: partitaGioca.fen(),
        draggable: true,
        trashSpeed: 'slow',
        orientation: coloreUtente === 'w' ? 'white' : 'black',
        onDragStart: onDragStartGioca,
        onMouseenterSquare: onMouseEnterSquareGioca,
        onMousedownSquare: onMousedownSquareGioca,
        onDrop: onDropGioca,
    });
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
    if (sezioneCorrente === "giocaRandom" && scacchieraGioca.orientation().slice(0, 1) !== partitaGioca.turn()) return;
    gestisciClick(args, partitaGioca, scacchieraGioca, getCasellaCliccata, onDropGioca, setCasellaCliccata, scacchieraCorrente);
}

function onDropSolo(args) {
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

        if (partitaGioca.game_over()) {
            document.getElementById("messaggioSolo").innerText = partitaGioca.in_checkmate() ? "Vince il " + (partitaGioca.turn() === 'w' ? "nero!" : "bianco!") : "Patta!";
        }

        let datiDaInviare1 = {
            operazione: 'faiMossa',
            mossa: mossa,
            codice: codicePartita
        }
        let datiDaInviare2 = {
            operazione: 'aspettaMossa',
            codice: codicePartita
        };
        inviaMossaeAspetta(datiDaInviare1, datiDaInviare2, mossa);

        if (partitaGioca.game_over()) {
            document.getElementById("messaggioRandom").innerText = partitaGioca.in_checkmate() ? "Hai vinto!" : "Patta!";
            return;
        }
    }
}

async function inviaMossaeAspetta(dati1, dati2, mossa) {
    console.log("mossa inviata: " + mossa);
    if (dati1 !== null) {
        await inviaDatiAlServer(dati1);
    }
    let datiRicevuti = await inviaDatiAlServer(dati2);
    if (datiRicevuti['mossa'] === mossa) {
        setTimeout(function () {
            inviaMossaeAspetta(null, dati2, mossa);
        }, 1000);
    } else {
        eseguiMossa(datiRicevuti['mossa'], partitaGioca, scacchieraGioca);
        if (partitaGioca.game_over()) {
            document.getElementById("messaggioRandom").innerText = partitaGioca.in_checkmate() ? "Hai perso!" : "Patta!";
        }
    }
}

async function aspettaGiocatori(dati1, dati2) {
    if (dati1 !== null) {
        let datiRicevuti = await inviaDatiAlServer(dati1);
        console.log(datiRicevuti);
        codicePartita = datiRicevuti['codice'];
        dati2['codice'] = codicePartita;
        coloreUtente = datiRicevuti['colore'];
    }
    console.log("codice partita: " + codicePartita);
    let datiRicevuti = await inviaDatiAlServer(dati2);
    let giocatore2 = datiRicevuti['giocatore2'];
    if (giocatore2 !== null && typeof giocatore2 !== 'undefined') {
        partitaInit = true;
        aggiornaScacchieraGioca(scacchieraCorrente)
        document.getElementById("messaggioRandom").innerText = "Partita iniziata!";
    } else {
        setTimeout(function () {
            aspettaGiocatori(null, dati2);
        }, 1000);
    }
}

function creaPartitaeAspetta() {
    let datiDaInviare1 = {
        operazione: 'creaPartita',
        username: nomeUtente,
    }
    let datiDaInviare2 = {
        operazione: 'aspettaGiocatori',
        codice: codicePartita
    }
    aspettaGiocatori(datiDaInviare1, datiDaInviare2);
    document.getElementById("messaggioRandom").innerText = "In attesa di un avversario...";
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
        scacchieraGioca = Chessboard2(scacchieraCorrente)
        partitaGioca = Chess();
        if (nomeUtente === '') {
            document.getElementById("messaggioRandom").innerText = "Devi essere loggato per giocare!";
            return;
        }
        return creaPartitaeAspetta();
    }

    aggiornaScacchieraGioca(scacchieraCorrente)
}

mostraGioca("giocaComputer");

document.getElementById("giocaComputerButton").addEventListener("click", function () {
    mostraGioca("giocaComputer");
});
document.getElementById("giocaSoloButton").addEventListener("click", function () {
    mostraGioca("giocaSolo");
});
document.getElementById("giocaRandomButton").addEventListener("click", function () {
    mostraGioca("giocaRandom");
});