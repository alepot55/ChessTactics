let indice = 0;
let soluzione = null;
const velocita = 500;
const coloreCasellaBianca = '#a9a9a9'
const coloreCasellaNera = '#696969'
let casellaCliccata = null;
let scacchiera = Chessboard2('problema', 'start');
let partita = null;

function eseguiMossa() {
    let mossa = ottieniProssimaMossa();
    partita.move({
        from: mossa.slice(0, 2),
        to: mossa.slice(2, 4),
        promotion: 'q'
    });
    scacchiera.position(partita.fen(), 'slow');
}

function ottieniProssimaMossa(aggiorna = true) {
    let mossa = soluzione.split(' ')[0];
    if (aggiorna) soluzione = soluzione.slice(mossa.length + 1);
    return mossa;
}

function aggiornaScacchiera(problema) {
    partita = new Chess(problema[1]);
    let configurazione = {
        draggable: true,
        position: partita.fen(),
        onDragStart: bloccaMovimento,
        onDrop: verificaMossa,
        orientation: partita.turn() === 'w' ? 'black' : 'white',
        onMouseenterSquare: mostraSuggerimentiTemp,
        trashSpeed: 'slow',
        onMousedownSquare: gestisciClick,
    }
    window.setTimeout(eseguiMossa, velocita);
    scacchiera = Chessboard2('problema', configurazione);
    casellaCliccata = null;
    soluzione = problema[2];
    document.getElementById('soluzione').textContent = soluzione;
}

function gestisciClick(args) {
    if (soluzione.length === 0) return;
    let mossa = clickMossa(args);
    if (mossa !== null) verificaMossa(mossa);
}

function clickMossa(args) {
    if (args['square'] == null) return null;
    let mossa = null;
    if (casellaCliccata !== null) {
        if (casellaCliccata !== args['square']) rimuoviSuggerimenti();
        mossa = {'source': casellaCliccata, 'target': args['square']};
        casellaCliccata = null;
    } else {
        let pezzoCorretto = partita.get(args['square']) !== null && partita.get(args['square'])['color'] === scacchiera.orientation().slice(0, 1);
        casellaCliccata = pezzoCorretto ? args['square'] : null;
        mostraSuggerimenti(args);
    }
    return mossa;
}

function mostraSuggerimenti(args) {
    if (soluzione.length === 0) return;
    let mosse = partita.moves({
        square: args.square,
        verbose: true
    });
    if (mosse.length === 0) return;
    mosse.forEach(mossa => {
        coloraCasella(mossa.to);
    });
}

function rimuoviSuggerimenti() {
    document.querySelectorAll('[data-square-coord]').forEach(casella => {
        casella.style.backgroundColor = '';
    });
}

function mostraSuggerimentiTemp(args) {
    if (casellaCliccata) return;
    rimuoviSuggerimenti();
    mostraSuggerimenti(args);
}

function coloraCasella(casella) {
    const $casella = document.querySelector('[data-square-coord="' + casella + '"]')

    let colore = coloreCasellaBianca
    if ($casella.classList.contains('black-b7cb6')) colore = coloreCasellaNera;

    $casella.style.backgroundColor = colore;
}

function isCasellaColorata(casella) {
    const $casella = document.querySelector('[data-square-coord="' + casella + '"]')
    return $casella.style.backgroundColor === coloreCasellaBianca || $casella.style.backgroundColor === coloreCasellaNera;
}

function bloccaMovimento(args) {
    if ((partita.turn() === 'w' && args['piece'].search(/^b/) !== -1) ||
        (partita.turn() === 'b' && args['piece'].search(/^w/) !== -1)) {
        return false
    }
}

function isPezzoBianco(pezzo) { return /^w/.test(pezzo) }
function isPezzoNero(pezzo) { return /^b/.test(pezzo) }

async function gestisciRispostaProblema(response) {
    if (response.ok) {
        const problema = await response.json();
        aggiornaScacchiera(problema);
    }
}

async function caricaProblema() {
    const url = `http://localhost:3000/server.php?indice=${indice}`;
    const response = await fetch(url);
    await gestisciRispostaProblema(response);

    indice++;
    document.getElementById('risolvi').disabled = false;
    document.getElementById('descrizione').textContent = 'Risolvi il problema!';
}

function verificaMossa(args) {
    let mossa = ottieniProssimaMossa(aggiorna = false).slice(0, 4);
    let mosseLegali = partita.moves({
        square: args['source'],
        verbose: true
    });
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) {
        return 'snapback';
    } else if (args['source'] + args['target'] === mossa) {
        rimuoviSuggerimenti();
        risolvi()
        mossaGiusta()
    } else {
        mossaSbagliata()
        return 'snapback'
    }
}

function mossaSbagliata() {
    document.getElementById('descrizione').textContent = 'Mossa errata!';
}

function vittoria() {
    document.getElementById('descrizione').textContent = 'Complimenti hai completato il puzzle!';
}

function mossaGiusta() {
    punteggio = punteggio + 1;
    ricaricaProfilo()
    if (soluzione.length === 0) {
        return vittoria()
    }
    document.getElementById('descrizione').textContent = 'Esatto, continua così!';
    0
}

function risolvi() {
    eseguiMossa();
    if (soluzione.length === 0) {
        document.getElementById('descrizione').textContent = 'Prova il prossimo problema!';
        document.getElementById('risolvi').disabled = true;
        return
    }
    window.setTimeout(eseguiMossa, velocita);
}

caricaProblema();

document.getElementById('aggiorna').addEventListener('click', function () { caricaProblema(); });
document.getElementById('risolvi').addEventListener('click', function () { risolvi(); });
