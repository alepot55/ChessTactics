// Colonne problemi: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
var indice = 0;
var sol = null;

board = Chessboard2('problema', 'start');

// Funzione per aggiornare la scacchiera con una nuova FEN
function aggiornaScacchiera(problema) {
    const config = {
        draggable: true,
        position: problema[1],
        onDrop: controllaMossa,
    }
    board = Chessboard2('problema', config);
    sol = problema[2];
}

// Funzione per creare una nuova richiesta AJAX
function creaRichiestaAjax(url, metodo) {
    var xhr = new XMLHttpRequest();
    xhr.open(metodo, url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    return xhr;
}

// Funzione per gestire la risposta di una richiesta di caricamento problema
function gestisciRispostaProblema(xhr) {
    if (xhr.status === 200) {
        var problema = JSON.parse(xhr.responseText);
        console.log(problema);
        aggiornaScacchiera(problema);
    }
}

// Funzione per caricare un problema
function caricaProblema(i) {
    var xhr = creaRichiestaAjax('http://localhost:3000/server.php?problema_index=' + i, 'GET');

    xhr.onload = function () {
        gestisciRispostaProblema(xhr);
    };

    xhr.send();

    indice++;
    document.getElementById('descrizione').textContent = 'Risolvi il problema!';
}

function controllaMossa(args) {
    sol_src = sol.split(' ')[0].slice(0, 2)
    sol_tar = sol.split(' ')[0].slice(2, 4)
    if (args['source'] === sol_src && args['target'] === sol_tar) {
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
    if (sol.length === 9) {
        return vittoria()
    }
    document.getElementById('descrizione').textContent = 'Esatto, continua così!';
    board.move(sol.slice(5, 7) + '-' + sol.slice(7, 9))
    sol = sol.slice(10)
}

// Carica il problema iniziale 
caricaProblema(indice);
document.getElementById('aggiorna').addEventListener('click', function () {
    caricaProblema(indice);
});
