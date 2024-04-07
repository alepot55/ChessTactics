loggato = false;
url = `http://localhost:3000/server.php`;
username = '';
punteggio = 0;

// Funzione per gestire l'invio dei dati al server
async function accediProfilo(tipoOperazione, event) {

    // Ottiene il nome utente e la password
    let user = document.getElementById('usernameAccedi').value;
    let pass = document.getElementById('passwordAccedi').value;

    // Crea un oggetto con i dati da inviare
    let data = {
        username: user,
        password: pass,
        punteggio: punteggio,
        operazione: tipoOperazione
    };

    let dati = await inviaDati(data, event);

    if (dati['messaggio'] == 'Login riuscito' || dati['messaggio'] == 'Registrazione riuscita') {
        loggato = true;
        username = user;
        ricaricaProfilo();
    } else {
        document.getElementById('rispostaAccedi').innerHTML = dati['messaggio'];
    }
}

// Funzione per gestire il logout
async function logout(event) {

    let data = {
        operazione: 'logout'
    };

    let dati = await inviaDati(data, event);

    if (dati['messaggio'] == 'Logout riuscito') {
        loggato = false;
        ricaricaProfilo();
    }
}

async function eliminaProfilo(event) {

    let data = {
        username: username,
        password: document.getElementById('passwordElimina').value,
        operazione: 'elimina'
    };

    let dati = await inviaDati(data, event);

    if (dati['messaggio'] == 'Account eliminato') {
        loggato = false;
        username = '';
        ricaricaProfilo();
    }
}

async function modificaProfilo(event) {

    nuovoUsername = document.getElementById('nuovoUsername').value;
    nuovaPassword = document.getElementById('nuovaPassword').value;

    let data = {
        username: username,
        nuovoUsername: nuovoUsername,
        nuovaPassword: nuovaPassword,
        operazione: 'modifica'
    };

    let dati = await inviaDati(data, event);

    if (dati['messaggio'] == 'Modifica effettuata') {
        username = nuovoUsername;
        ricaricaProfilo();
    }

    document.getElementById('rispostaModifica').innerHTML = dati['messaggio'];
}

// Funzione per inviare e ricevere la risposta dal server
async function inviaDati(data, event) {
    event.preventDefault();
    let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
    });

    if (response.ok) {
        return await response.json();
    }
}

function ricaricaProfilo() {
    document.getElementById('accediProfilo').style.display = loggato ? 'none' : 'block';
    document.getElementById('profiloUtente').style.display = loggato ? 'block' : 'none';
    document.getElementById('modificaProfilo').style.display = loggato ? 'block' : 'none';
    document.getElementById('eliminaProfilo').style.display = loggato ? 'block' : 'none';
    document.getElementById('usernameProfilo').innerHTML = username;
    document.getElementById('punteggioProfilo').innerHTML = punteggio;
}

// Aggiunge gli event listener ai pulsanti
document.getElementById('loginButton').addEventListener('click', (event) => accediProfilo('login', event));
document.getElementById('registerButton').addEventListener('click', (event) => accediProfilo('registrazione', event));
document.getElementById('logoutButton').addEventListener('click', (event) => logout(event));
document.getElementById('eliminaButton').addEventListener('click', (event) => eliminaProfilo(event));
document.getElementById('modificaButton').addEventListener('click', (event) => modificaProfilo(event));

ricaricaProfilo();
