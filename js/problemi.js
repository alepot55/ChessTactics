var indice = 0;
var soluzione = null;
const velocita = 500;
var casellaCliccata = null;
var scacchiera = Chessboard2('problema', 'start');
var partita = null;

function aggiornaScacchieraProblema(problema) {
    partita = new Chess(problema[1]);
    let configurazione = {
        draggable: true,
        position: partita.fen(),
        orientation: partita.turn() === 'w' ? 'black' : 'white',
        trashSpeed: 'slow',
        onDragStart: onDragStartProblemi,
        onMouseenterSquare: onMouseEnterSquareProblemi,
        onMousedownSquare: onMousedownSquareProblemi,
        onDrop: verificaMossa,
    }
    soluzione = problema[2];
    setCasellaCliccata(null)
    let mossa = ottieniProssimaMossa();
    window.setTimeout(() => eseguiMossa(mossa, partita, scacchiera), velocita);
    scacchiera = new Chessboard2('problema', configurazione);
    document.getElementById('soluzione').textContent = soluzione;
}

function setCasellaCliccata(casella) {
    casellaCliccata = casella;
}

function getCasellaCliccata() {
    return casellaCliccata;
}

function onDragStartProblemi(args) {
    return bloccaMossa(args['piece'], partita);
}

function onMouseEnterSquareProblemi(args) {
    mostraSuggerimenti(args, partita, getCasellaCliccata, 'problema');
}

function onMousedownSquareProblemi(args) {
    if (soluzione.length === 0) return;
    gestisciClick(args, partita, scacchiera, getCasellaCliccata, verificaMossa, setCasellaCliccata, 'problema');
}

function ottieniProssimaMossa(aggiorna = true) {
    let mossa = soluzione.split(' ')[0];
    if (aggiorna) soluzione = soluzione.slice(mossa.length + 1);
    return mossa;
}

async function caricaProblema() {

    let datiDaInviare = {
        operazione: 'problema',
        indice: indice
    }
    
    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    aggiornaScacchieraProblema(datiRicevuti['problema']);

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
    punteggioUtente = punteggioUtente + 1;
    aggiornaProfilo()
    if (soluzione.length === 0) {
        return vittoria()
    }
    document.getElementById('descrizione').textContent = 'Esatto, continua così!';
    0
}

function risolvi() {
    let mossa = ottieniProssimaMossa();
    eseguiMossa(mossa, partita, scacchiera);
    if (soluzione.length === 0) {
        document.getElementById('descrizione').textContent = 'Prova il prossimo problema!';
        document.getElementById('risolvi').disabled = true;
        return
    }
    mossa = ottieniProssimaMossa();
    window.setTimeout(() => eseguiMossa(mossa, partita, scacchiera), velocita);
}

caricaProblema();

document.getElementById('aggiorna').addEventListener('click', function () { caricaProblema(); });
document.getElementById('risolvi').addEventListener('click', function () { risolvi(); });
