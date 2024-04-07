// Colonne problemi: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
var indice = 0;
var sol = null;
const velocita = 500;
const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'
var cliccato = null;
var board = Chessboard2('problema', 'start');;
var game = null;


// Funzione per fare mosse sulla scacchiera
function faiMossa() {
    mossa = prossimaMossa();
    game.move({
        from: mossa.slice(0, 2),
        to: mossa.slice(2, 4),
        promotion: 'q'
    });
    board.position(game.fen(), 'slow');
}

function prossimaMossa(aggiorna = true) {
    mossa = sol.split(' ')[0];
    if (aggiorna) sol = sol.slice(mossa.length + 1);
    return mossa;
}

// Funzione per aggiornare la scacchiera con una nuova FEN
function aggiornaScacchiera(problema) {
    game = new Chess(problema[1]);
    let config = {
        draggable: true,
        position: game.fen(),
        onDragStart: bloccaMosse,
        onDrop: checkMossa,
        orientation: game.turn() === 'w' ? 'black' : 'white',
        onMouseenterSquare: mostraOmbreTemp,
        trashSpeed: 'slow',
        onMousedownSquare: clicca,
    }
    window.setTimeout(faiMossa, velocita);
    board = Chessboard2('problema', config);
    cliccato = null;
    sol = problema[2];
    document.getElementById('soluzione').textContent = sol;
}

function clicca(args) {
    if (sol.length === 0 || args['square'] == null) return;
    if (cliccato !== null) {
        checkMossa({
            'source': cliccato,
            'target': args['square']
        });
    } else {
        let pezzoGiusto = game.get(args['square']) !== null && game.get(args['square'])['color'] === board.orientation().slice(0, 1);
        cliccato = pezzoGiusto ? args['square'] : null;
        mostraOmbre(args);
    }
}

function mostraOmbre(args) {
    if (sol.length === 0) return;
    let moves = game.moves({
        square: args.square,
        verbose: true
    });
    if (moves.length === 0) return;
    moves.forEach(move => {
        greySquare(move.to);
    });

}

function togliOmbre() {
    document.querySelectorAll('[data-square-coord]').forEach(square => {
        square.style.backgroundColor = '';
    });
}

// Funzione per mostrare i marker sulle caselle
function mostraOmbreTemp(args) {
    if (cliccato) return;
    togliOmbre();
    mostraOmbre(args);
}

function greySquare(square) {
    const $square = document.querySelector('[data-square-coord="' + square + '"]')

    let background = whiteSquareGrey
    if ($square.classList.contains('black-b7cb6')) background = blackSquareGrey;

    $square.style.backgroundColor = background;
}

function isGreySquare(square) {
    const $square = document.querySelector('[data-square-coord="' + square + '"]')
    return $square.style.backgroundColor === whiteSquareGrey || $square.style.backgroundColor === blackSquareGrey;
}

function bloccaMosse(args) {
    if ((game.turn() === 'w' && args['piece'].search(/^b/) !== -1) ||
        (game.turn() === 'b' && args['piece'].search(/^w/) !== -1)) {
        return false
    }
}

function isWhitePiece(piece) { return /^w/.test(piece) }
function isBlackPiece(piece) { return /^b/.test(piece) }

// Funzione per gestire la risposta del problema
async function gestisciRispostaProblema(response) {
    if (response.ok) {
        const problema = await response.json();
        aggiornaScacchiera(problema);
    }
}

// Funzione per caricare un problema
async function caricaProblema() {
    const url = `http://localhost:3000/server.php?indice=${indice}`;
    const response = await fetch(url);
    await gestisciRispostaProblema(response);

    indice++;
    document.getElementById('risolvi').disabled = false;
    document.getElementById('descrizione').textContent = 'Risolvi il problema!';
}


function checkMossa(args) {
    mossa = prossimaMossa(aggiorna = false).slice(0, 4);
    legali = game.moves({
        square: args['source'],
        verbose: true
    });
    if (!legali.some(legale => legale.to === args['target'])) {
        return 'snapback';
    } else if (args['source'] + args['target'] === mossa) {
        cliccato = null;
        togliOmbre();
        risolvi()
        mossaCorretta()
    } else {
        mossaErrata()
        return 'snapback'
    }
}

function mossaErrata() {
    document.getElementById('descrizione').textContent = 'Mossa errata!';
}

function vittoria() {
    document.getElementById('descrizione').textContent = 'Complimenti hai completato il puzzle!';
}

function mossaCorretta() {
    punteggio = punteggio + 1;
    ricaricaProfilo()
    if (sol.length === 0) {
        return vittoria()
    }
    document.getElementById('descrizione').textContent = 'Esatto, continua così!';
    0
}

function risolvi() {
    faiMossa();
    if (sol.length === 0) {
        document.getElementById('descrizione').textContent = 'Prova il prossimo problema!';
        document.getElementById('risolvi').disabled = true;
        return
    }
    window.setTimeout(faiMossa, velocita);
}

// Carica il problema iniziale 
caricaProblema();

document.getElementById('aggiorna').addEventListener('click', function () { caricaProblema(); });
document.getElementById('risolvi').addEventListener('click', function () { risolvi(); });
