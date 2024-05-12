const tabellone = document.querySelector('.tabellone');
const cronologiaPartite = document.querySelector('.cronologia');

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
        riga.innerHTML = `
            <td>${partita['avversario']}</td>
            <td>${partita['punteggio_avversario']}</td>
        `;
        cronologiaPartite.appendChild(riga);
    }
}

aggiornaClassifica();
aggiornaCronologia();