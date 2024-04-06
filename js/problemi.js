// Colonne problemi: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
var indice = 0;
var sol = null;
const velocita = 700;
const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'
togliMarker = false;


// Funzione per fare mosse sulla scacchiera
function faiMossa() {
    mossa = prossimaMossa();
    game.move({
        from: mossa.slice(0, 2),
        to: mossa.slice(2, 4),
        promotion: 'q'
    });
    board.position(game.fen());
}

function prossimaMossa(aggiorna = true) {
    mossa = sol.split(' ')[0];
    if (aggiorna) sol = sol.slice(mossa.length + 1);
    return mossa;
}

// Funzione per aggiornare la scacchiera con una nuova FEN
function aggiornaScacchiera(problema) {
    game = new Chess(problema[1]);
    const config = {
        draggable: true,
        position: game.fen(),
        onDragStart: bloccaMosse,
        onDrop: checkMossa,
        orientation: game.turn() === 'w' ? 'black' : 'white',
        onMouseenterSquare: mostraOmbre,
    }
    window.setTimeout(faiMossa, velocita);
    board = Chessboard2('problema', config);
    sol = problema[2];
    document.getElementById('soluzione').textContent = sol;
}

// Funzione per mostrare i marker sulle caselle
function mostraOmbre(args) {
    let moves = game.moves({
        square: args.square,
        verbose: true
    });
    if (togliMarker) {
        document.querySelectorAll('[data-square-coord]').forEach(square => {
            square.style.backgroundColor = '';
        });
    }
    if (moves.length === 0) return;
    togliMarker = true;
    moves.forEach(move => {
        greySquare(move.to);
    });
}

function greySquare(square) {
    const $square = document.querySelector('[data-square-coord="' + square + '"]')

    let background = whiteSquareGrey
    if ($square.classList.contains('black-b7cb6')) background = blackSquareGrey;

    $square.style.backgroundColor = background;
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
    if (args['source'] + args['target'] === mossa) {
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
