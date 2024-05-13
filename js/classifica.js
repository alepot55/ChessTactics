const tabellone = document.querySelector('.tabellone');
const cronologiaPartite = document.querySelector('.cronologia');

var scacchiera = new Scacchiera('scacchieraRivedi', DEFAULT_POSITION_WHITE, false, get('temaPezzi'), get('colore'), null);

async function classifica() {
    let datiDaInviare = {
        "operazione": "classifica"
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    return datiRicevuti['classifica'];
}

async function cronologia() {
    let datiDaInviare = {
        "operazione": "partiteGiocate",
        "username": get('username')
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    return datiRicevuti['partite'];
}

async function rivedi(codice) {
    let datiDaInviare = {
        "operazione": "mossePartita",
        "codice": codice,
        "username": get('username')
    };

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    scacchiera.posizione(DEFAULT_POSITION_WHITE, datiRicevuti['orientamento']);

    console.log(datiRicevuti);

    for (let mossa of datiRicevuti['mosse']) {
        scacchiera.eseguiMossa(mossa['mossa']);
    }

    scacchiera.inizio();
}

async function aggiornaClassifica() {
    let classificaUtenti = await classifica();

    tabellone.innerHTML = '';

    let i = 1;
    for (let utente of classificaUtenti) {
        let riga = document.createElement('tr');
        riga.innerHTML = `
            <td>${i}</td>
            <td>${utente['username']}</td>
            <td>${utente['punteggio']}</td>
        `;
        tabellone.appendChild(riga);
        i++;
    }
}

async function aggiornaCronologia() {
    let partite = await cronologia();

    cronologiaPartite.innerHTML = '';

    for (let partita of partite) {
        let riga = document.createElement('tr');
        let vittoria = partita['vittoria'] === 1 ? 'Vittoria' : partita['vittoria'] === 0 ? 'Pareggio' : 'Sconfitta';
        riga.innerHTML = `
            <td>${partita['avversario']}</td>
            <td>${partita['punteggio_avversario']}</td>
            <td>${vittoria}</td>
            <td><button onclick="rivedi(${partita['codice']})">Rivedi</button></td>
        `;
        cronologiaPartite.appendChild(riga);
    }
}

aggiornaClassifica();
aggiornaCronologia();

var elementi = document.getElementsByClassName('indietro');
for (var i = 0; i < elementi.length; i++) {
    elementi[i].addEventListener('click', function () {
        scacchiera.indietro();
    });
}

var elementi = document.getElementsByClassName('avanti');
for (var i = 0; i < elementi.length; i++) {
    elementi[i].addEventListener('click', function () {
        scacchiera.avanti();
    });
}

var elementi = document.getElementsByClassName('ritorna');
for (var i = 0; i < elementi.length; i++) {
    elementi[i].addEventListener('click', function () {
        scacchiera.ritorna();
    });
}

var elementi = document.getElementsByClassName('inizio');
for (var i = 0; i < elementi.length; i++) {
    elementi[i].addEventListener('click', function () {
        scacchiera.inizio();
    });
}