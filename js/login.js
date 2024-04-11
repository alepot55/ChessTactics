nomeUtente = null;
punteggioUtente = 0;

async function gestisciAccessoProfilo(tipoOperazione, evento) {
    let nomeUtenteInput = document.getElementById('usernameAccedi').value;
    let passwordInput = document.getElementById('passwordAccedi').value;

    if (nomeUtenteInput == '' || passwordInput == '') {
        evento.preventDefault();
        document.getElementById('rispostaAccedi').innerHTML = 'Inserire username e password';
        return;
    }

    let datiDaInviare = {
        username: nomeUtenteInput,
        password: passwordInput,
        punteggio: punteggioUtente,
        operazione: tipoOperazione
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Login riuscito' || datiRicevuti['messaggio'] == 'Registrazione riuscita') {
        nomeUtente = nomeUtenteInput;
        punteggioUtente = datiRicevuti['punteggio'];
        aggiornaProfilo();
    } else {
        document.getElementById('rispostaAccedi').innerHTML = datiRicevuti['messaggio'];
    }
}

async function eseguiLogout(evento) {
    let datiDaInviare = {
        operazione: 'logout'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Logout riuscito') {
        nomeUtente = null;
        aggiornaProfilo();
    }
}

async function eliminaProfiloUtente(evento) {
    let datiDaInviare = {
        username: nomeUtente,
        password: document.getElementById('passwordElimina').value,
        operazione: 'elimina'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Account eliminato') {
        nomeUtente = null;
        aggiornaProfilo();
    }
}

async function modificaProfiloUtente(evento) {
    let nuovoNomeUtente = document.getElementById('nuovoUsername').value;
    let nuovaPassword = document.getElementById('nuovaPassword').value;

    let datiDaInviare = {
        username: nomeUtente,
        nuovoUsername: nuovoNomeUtente,
        nuovaPassword: nuovaPassword,
        operazione: 'modifica'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Modifica effettuata') {
        nomeUtente = nuovoNomeUtente;
        aggiornaProfilo();
    }

    document.getElementById('rispostaModifica').innerHTML = datiRicevuti['messaggio'];
}

function aggiornaProfilo() {
    let utenteLoggato = nomeUtente != null;
    document.getElementById('accediProfilo').style.display = utenteLoggato ? 'none' : 'block';
    document.getElementById('profiloUtente').style.display = utenteLoggato ? 'block' : 'none';
    document.getElementById('modificaProfilo').style.display = utenteLoggato ? 'block' : 'none';
    document.getElementById('eliminaProfilo').style.display = utenteLoggato ? 'block' : 'none';
    document.getElementById('usernameProfilo').innerHTML = nomeUtente;
    document.getElementById('punteggioProfilo').innerHTML = punteggioUtente;
}

document.getElementById('loginButton').addEventListener('click', (evento) => gestisciAccessoProfilo('login', evento));
document.getElementById('registerButton').addEventListener('click', (evento) => gestisciAccessoProfilo('registrazione', evento));
document.getElementById('logoutButton').addEventListener('click', (evento) => eseguiLogout(evento));
document.getElementById('eliminaButton').addEventListener('click', (evento) => eliminaProfiloUtente(evento));
document.getElementById('modificaButton').addEventListener('click', (evento) => modificaProfiloUtente(evento));
document.getElementById('salvaPreferenze').addEventListener('click', function () {
    temaPezzi = document.getElementById('temaPezzi').value;
    temaScacchiera = document.getElementById('temaScacchiera').value;
    applicaTema();
});

aggiornaProfilo();
