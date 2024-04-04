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

