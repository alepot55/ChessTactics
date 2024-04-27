const indirizzoServer = `http://localhost:3000/server.php`;
const tempoCookie = 60 * 60 * 24 * 30;
modNotte = false;

function cambiaModNotte(flag = null) {
    if (flag == null) {
        flag = get("notte") == "false" ? true : false;
    }
    var root = document.documentElement;
    root.style.setProperty('--tema', flag ? 'dark' : 'light');
    root.style.setProperty('--notte', flag ? '1' : '0');
    set("notte", flag);
}

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
    document.cookie = campo + "=" + valore + "; max-age=" + tempoCookie;
}

function get(campo) {
    if (!document.cookie.includes(campo)) return null;
    let user = document.cookie.split(campo + '=')[1].split(';')[0];
    if (user == 'null') user = null;
    return user;
}

if (get("temaPezzi") == null) {
    set("temaPezzi", "simple");
}
if (get("temaScacchiera") == null) {
    set("temaScacchiera", "simple");
}
if (get("notte") == null) {
    set("notte", "false");
} else {
    cambiaModNotte(get("notte") == "true" ? true : false);
}

document.getElementById("btnNotte").addEventListener("click", () => {
    cambiaModNotte();
});