const indirizzoServer = `http://localhost:3000/server.php`;
temaPezzi = 'simple';
temaScacchiera = 'simple';
modNotte = false;

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

// // Esempio di utilizzo:
// const mioTimer = new Timer(10); // Parte da 10 secondi
// mioTimer.start(); // Avvia il timer

// // Dopo 5 secondi, metti in pausa il timer
// setTimeout(() => {
//     mioTimer.pausa();
//     console.log("Timer in pausa.");
// }, 5000);

// // Dopo altri 3 secondi, riprendi il timer
// setTimeout(() => {
//     mioTimer.riprendi();
//     console.log("Timer ripreso.");
// }, 8000);


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
