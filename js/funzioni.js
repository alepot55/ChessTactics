const indirizzoServer = `http://localhost:3000/server.php`;
temaPezzi = 'simple';
temaScacchiera = 'simple';
modNotte = false;
const buttModNotte = document.getElementById("modalitaNotteButton");

buttModNotte.addEventListener("click", function () {
  modNotte = !modNotte;
  scacchieraGiocaComputer.cambiaTema(temaPezzi, temaScacchiera);
  scacchieraGiocaMultiplayer.cambiaTema(temaPezzi, temaScacchiera);
  scacchieraGiocaSolo.cambiaTema(temaPezzi, temaScacchiera);
  scacchieraProblemi.cambiaTema(temaPezzi, temaScacchiera);
});

class Timer {
    constructor(callback, seconds) {
        this.callback = callback;
        this.totalSeconds = seconds;
        this.currentTime = seconds;
        this.isPaused = false;
        this.intervalId = null;
    }

    start() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                if (!this.isPaused) {
                    this.currentTime -= 0.1;
                    this.callback(this.currentTime);
                    if (this.currentTime <= 0) {
                        this.stop();
                        console.log("Il timer è scaduto!");
                    }
                }
            }, 100);
        }
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    pausa() {
        this.isPaused = true;
    }

    riprendi() {
        this.isPaused = false;
    }

    isFinito() {
        return this.currentTime <= 0;
    }
}

// Invoa i dati al server e restituisci la risposta
async function inviaDatiAlServer(dati, evento = null) {
    console.log(dati);

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


function set(campo, valore) {
    document.cookie = campo + "=" + valore + "; max-age=" + 60 * 60 * 24 * 30;
}

function get(campo) {
    if (!document.cookie.includes(campo)) return;
    let user = document.cookie.split(campo + '=')[1].split(';')[0];
    if (user == 'null') user = null;
    return user;
}