const indirizzoServer = `http://localhost:3000/server.php`;
const tempoCookie = 60 * 60 * 24 * 30;

modNotte = false;

// Funzione per cambiare il tema della pagina
function cambiaModNotte(flag = null) {
    if (flag == null) {
        flag = get("notte") == "false" ? true : false;
    }
    var root = document.documentElement;
    root.style.setProperty('--tema', flag ? 'dark' : 'light');
    root.style.setProperty('--notte', flag ? '1' : '0');
    document.getElementById("sole").style.display = flag ? "block" : "none";
    document.getElementById("luna").style.display = flag ? "none" : "block";
    set("notte", flag);
}

// Classe per gestire un timer
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

// Invia i dati al server e restituisci la risposta
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
        let datiRicevuti = await risposta.json();
        return datiRicevuti;
    }
}

// Funzione per impostare e ottenere i cookie
function set(campo, valore) {
    document.cookie = campo + "=" + valore + "; max-age=" + tempoCookie;
}

// Funzione per ottenere i cookie
function get(campo) {
    if (!document.cookie.includes(campo)) return null;
    let user = document.cookie.split(campo + '=')[1].split(';')[0];
    if (user == 'null') user = null;
    return user;
}

// Funzione per ottenere la mossa consigliata da Stockfish
function getStockfishMove(fen, elo) {
    console.log(fen, elo);
    stockfish.postMessage('uci');
    stockfish.postMessage(`setoption name Skill Level value ${elo}`);
    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage('go depth 20');

    let mossa = null;

    stockfish.onmessage = function (event) {
        // Assicurati di filtrare la mossa effettiva dall'output di Stockfish
        if (event.data.startsWith('bestmove')) {
            mossa = event.data.split(' ')[1];
            console.log('La mossa consigliata è: ' + mossa);
            // Puoi fare qualcosa con la mossa qui
            stockfish.terminate();
        }
    };

    return mossa
}

// Funzione per aggiungere punti al profilo dell'utente
async function aggiungiPunti(punti) {

    if (get('username') == null || get('username') == 'null') return;

    let datiDaInviare = {
        username: get('username'),
        punti: punti,
        operazione: 'aggiungiPunti'
    }

    let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

    set('punteggio', parseInt(datiRicevuti['punteggio']));
}

async function fotoProfilo(username = get('username')) {
    if (username != null) {     // inviare dati al server per poter recuperare  l'immagine profilo scelta
        let datiDaInviare = {
            username: username,
            operazione: 'prendiImmagineProfilo'
        };

        let datiRicevuti = await inviaDatiAlServer(datiDaInviare);

        if (datiRicevuti['messaggio'] == 'Immagine profilo trovata') {
            let i = datiRicevuti['ret'];
            s = './assets/profili/img' + i + '.png';
        }
    }
    else {
        var s = './assets/profili/profilo_default.png';
    }

    return s;
}

if (get("temaPezzi") == null) {
    set("temaPezzi", "simple");
}
if (get("notte") == null) {
    set("notte", "false");
} else {
    cambiaModNotte(get("notte") == "true" ? true : false);
}
if (get("colore") == null) {
    set("colore", 220);
} else {
    var root = document.documentElement;
    root.style.setProperty('--colore', get("colore"));
}
if (get("nav_aperta") === "true") {
    document.documentElement.querySelector("nav").classList.add("nav_aperta");
    document.documentElement.style.setProperty('--nav_aperta', 1);
}



document.getElementById("btnNotte").addEventListener("click", () => {
    cambiaModNotte();
});

document.getElementById("btnEspandi").addEventListener("click", () => {
    var nav = document.querySelector("nav");
    document.documentElement.style.setProperty('--spostaBody', 1);
    if (nav.classList.contains("nav_aperta")) {
        nav.classList.remove("nav_aperta");
        set("nav_aperta", false);
    } else {
        nav.classList.add("nav_aperta");
        set("nav_aperta", true);
    }
    document.documentElement.style.setProperty('--nav_aperta', get("nav_aperta") == "true" ? 1 : 0);

});

const scrollContainers = document.getElementsByClassName("sceltamodalità");

for (let i = 0; i < scrollContainers.length; i++) {
    scrollContainers[i].addEventListener("wheel", (evt) => {
        evt.preventDefault();
        scrollContainers[i].scrollLeft += evt.deltaY;
    });
}
