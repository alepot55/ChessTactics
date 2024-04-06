// Funzione per gestire l'invio dei dati al server
async function inviaDatiAlServer(tipoOperazione, event) {

    // Previene il comportamento predefinito del form
    event.preventDefault();


    // Ottiene il nome utente e la password
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    // Costruisce l'URL per l'operazione
    let url = `http://localhost:3000/server.php`;

    // Crea un oggetto con i dati da inviare
    let data = {
        username: username,
        password: password,
        operazione: tipoOperazione
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
    });

    await risOperazione(response);
}

async function risOperazione(response) {
    console.log(response);
    if (response.ok) {
        const testo = await response.json();
        document.getElementById('loginMessage').innerHTML = testo;
    }
}

// Aggiunge gli event listener ai pulsanti
document.getElementById('loginButton').addEventListener('click', (event) => inviaDatiAlServer('login', event));
document.getElementById('registerButton').addEventListener('click', (event) => inviaDatiAlServer('registrazione', event));

