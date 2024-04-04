var num_problemi = 4;
var indici = Array(num_problemi).fill(0);

// Funzione per impostare un problema_i con un fen
function aggiornaScacchiera(i, fen) {
    game = new Chess(fen);
    board = Chessboard2('problema_' + i, {
        position: fen,
    });
}

function setProblema(index, num_problema) {
    // Crea una nuova richiesta AJAX
    var xhr = new XMLHttpRequest();

    // Configura la richiesta come GET alla URL del tuo script PHP
    xhr.open('GET', 'http://localhost:3000/server.php?problema_index=' + index, true);

    // Imposta l'intestazione della richiesta per accettare dati JSON
    xhr.setRequestHeader('Accept', 'application/json');

    // Gestisci la risposta
    xhr.onload = function() {
        if (xhr.status === 200) {
            // Parse the JSON response
            var problema = JSON.parse(xhr.responseText);

            aggiornaScacchiera(num_problema, problema[1]);
        }
    };

    // Invia la richiesta
    xhr.send();
}

// per ogni bottone "Problema i" imposta il problema i
for (var i = 0; i <= num_problemi-1; i++) {
    (function (i) {
        // Imposta il problema iniziale
        setProblema(indici[i], i);
        indici[i]++;

        // Aggiorna il problema quando il bottone viene premuto
        document.getElementById('richiedi_problema_' + i).addEventListener('click', function () {
            setProblema(indici[i], i);
            indici[i]++;
        });
    })(i);
}
