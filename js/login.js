nomeUtente = null;
punteggioUtente = 0;
var root = document.documentElement;
const dropdowns = document.querySelectorAll('.dropdown');

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
        set('username', nomeUtenteInput);
        set('punteggio', passwordInput);
        aggiornaProfilo();
    } else {
        document.getElementById('rispostaAccedi').innerHTML = datiRicevuti['messaggio'];
    }

    console.log(get('username'));
}

async function eseguiLogout(evento) {
    let datiDaInviare = {
        operazione: 'logout'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Logout riuscito') {
        set('username', null);
        set('punteggio', 0);
        aggiornaProfilo();
    }
}

async function eliminaProfiloUtente(evento) {
    let datiDaInviare = {
        username: get('username'),
        password: document.getElementById('passwordElimina').value,
        operazione: 'elimina'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Account eliminato') {
        set('username', null);
        set('punteggio', 0);
        aggiornaProfilo();
    }
}

async function modificaProfiloUtente(evento) {
    let nuovoNomeUtente = document.getElementById('nuovoUsername').value;
    let nuovaPassword = document.getElementById('nuovaPassword').value;

    let datiDaInviare = {
        username: get('username'),
        nuovoUsername: nuovoNomeUtente,
        nuovaPassword: nuovaPassword,
        operazione: 'modifica'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare, evento);

    if (datiRicevuti['messaggio'] == 'Modifica effettuata') {
        set('username', nuovoNomeUtente);
        aggiornaProfilo();
    }

    document.getElementById('rispostaModifica').innerHTML = datiRicevuti['messaggio'];
}

async function aggiornaProfilo() {
    let utenteLoggato = get('username') != null;
    document.getElementById('accediProfilo').style.display = utenteLoggato ? 'none' : 'block';
    document.getElementById('profiloUtente').style.display = utenteLoggato ? 'block' : 'none';
    document.getElementById('modificaProfilo').style.display = utenteLoggato ? 'block' : 'none';
    document.getElementById('eliminaProfilo').style.display = utenteLoggato ? 'block' : 'none';
    document.getElementById('bottoneModificaImg').style.display = utenteLoggato ? 'block' : 'none';

    if (utenteLoggato) {     // inviare dati al server per poter recuperare  l'immagine profilo scelta
        let datiDaInviare = {
            username: get('username'),
            operazione: 'prendiImmagineProfilo'
        };

        let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

        if (datiRicevuti['messaggio'] == 'Immagine profilo trovata') {
            console.log("immagine presa: ", datiRicevuti['ret']);       //debug
            switch (datiRicevuti['ret']) {
                case '1':
                    s = './assets/immaginiProfilo/usr1.jpg';
                    break;
                case '2':
                    s = './assets/immaginiProfilo/usr2.jpg';
                    break;
                case '3':
                    s = './assets/immaginiProfilo/usr3.jpg';
                    break;
                case '4':
                    s = './assets/immaginiProfilo/usr4.jpg';
                    break;
                case '5':
                    s = './assets/immaginiProfilo/usr5.jpg';
                    break;
                case '6':
                    s = './assets/immaginiProfilo/usr6.jpg';
                    break;
                case '7':
                    s = './assets/immaginiProfilo/usr7.jpg';
                    break;
                case '8':
                    s = './assets/immaginiProfilo/usr8.jpg';
                    break;
                case '9':
                    s = './assets/immaginiProfilo/usr9.jpg';
                    break;
                default:
                    s = './assets/immaginiProfilo/profilo_default.png';
            }
        }
    }
    else {
        var s = './assets/immaginiProfilo/profilo_default.png';
    }
    console.log("path immagine: ", s);
    document.getElementById('immagineProfilo').src = s;

    document.getElementById('usernameProfilo').innerHTML = get('username');
    document.getElementById('punteggioProfilo').innerHTML = punteggioUtente;
}

// codice per immagine profilo -----------------------------------------------------------------

async function caricaImmagine(x) {

    let datiDaInviare = {
        username: get('username'),
        immagine: x,
        operazione: 'setImmagineProfilo'
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    if (datiRicevuti['messaggio'] == 'Immagine profilo caricata') {
        //console.log("Immagine caricata nel server");
        aggiornaProfilo();
    }

    closePopup();
}

function openPopup() {
    let popup = document.getElementById("img-window");
    popup.classList.add("open-popup");
}

function closePopup() {
    let popup = document.getElementById("img-window");
    popup.classList.remove("open-popup");
}

// codice per dropdown -----------------------------------------------------------------
dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelectorAll('.menu li');
    const selected = dropdown.querySelector('.selected');

    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked');
        caret.classList.toggle('caret-rotate');
        menu.classList.toggle('menu-open');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            select.classList.remove('select-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');
            options.forEach(option => { option.classList.remove('active'); });
            option.classList.add('active');
        });
    });

});

// altro -----------------------------------------------------------------

document.getElementById('loginButton').addEventListener('click', (evento) => gestisciAccessoProfilo('login', evento));
document.getElementById('registerButton').addEventListener('click', (evento) => gestisciAccessoProfilo('registrazione', evento));
document.getElementById('logoutButton').addEventListener('click', (evento) => eseguiLogout(evento));
document.getElementById('eliminaButton').addEventListener('click', (evento) => eliminaProfiloUtente(evento));
document.getElementById('modificaButton').addEventListener('click', (evento) => modificaProfiloUtente(evento));
document.getElementById('salvaPreferenze').addEventListener('click', function () {
    set('temaPezzi', document.getElementById('temaPezzi').value);
});
document.getElementById("colore").oninput = function () {
    set("colore", this.value);
    root.style.setProperty('--colore', this.value);
};
document.getElementById("resetPreferenze").addEventListener('click', function () {
    set('temaPezzi', 'simple');
    set('colore', '220');
    root.style.setProperty('--colore', get('colore'));
    document.getElementById('temaPezzi').value = 'simple';
    document.getElementById('colore').value = get('colore');
});

aggiornaProfilo();