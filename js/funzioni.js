const indirizzoServer = `http://localhost:3000/server.php`;
temaPezzi = 'simple';
temaScacchiera = 'simple';
modNotte = false;

// Invoa i dati al server e restituisci la risposta
async function inviaDatiAlServer(dati, evento = null) {

    // Evita il comportamento di default del form (ricaricamento della pagina)
    if (evento !== null) evento.preventDefault();

    // Invia i dati al server e attendi la risposta
    let risposta = await fetch(indirizzoServer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(dati).toString()
    });

    // Se la risposta è ok, restituisci i dati ricevuti
    if (risposta.ok) {
        return await risposta.json();
    }
}
