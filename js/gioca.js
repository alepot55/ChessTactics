// le sezioni sono giocaComputer, giocaSolo, giocaMultiplayer
// le scacchiere sono scacchieraComputer, scacchieraSolo, scacchieraMultiplayer

const tempIntervallo = 100;
const timerUtente = new Timer(mostraTempoUtente, 60);
const timerAvversario = new Timer(mostraTempoAvversario, 60);
const stockfish = new Worker('node_modules/stockfish.js/stockfish.js');

// Variabili 
let sezioneCorrente = "giocaComputer";
let idScacchieraCorrente = "scacchieraComputer";
let modalitàMultiplayer = 'normale';
let codicePartita = null;
let partitaInit = false;
let coloreUtente = null;

// Bottoni
const buttStopRicercaMultiplayer = document.getElementById("stopRicercaMultiplayer");
const buttNuovaPartitaMultiplayer = document.getElementById("nuovaPartitaMultiplayer");
const buttTerminaPartitaMultiplayer = document.getElementById("terminaPartitaMultiplayer");
const buttNuovaPartitaComputer = document.getElementById("nuovaPartitaComputer");
const buttNuovaPartitaSolo = document.getElementById("nuovaPartitaSolo");

const messaggioMultiplayer = document.getElementById("messaggioMultiplayer");
const messaggioSolo = document.getElementById("messaggioSolo");
const messaggioComputer = document.getElementById("messaggioComputer");

const eloStockfish = document.getElementById("eloStockfish");

// Scacchiere
let scacchieraGiocaComputer = new Scacchiera('scacchieraComputer', DEFAULT_POSITION_WHITE, true, get('temaPezzi'), get('colore'), continuaMossaComputer, true);
let scacchieraGiocaSolo = new Scacchiera('scacchieraSolo', DEFAULT_POSITION_WHITE, true, get('temaPezzi'), get('colore'), continuaMossaSolo, true);
let scacchieraGiocaMultiplayer = new Scacchiera('scacchieraMultiplayer', '', true, get('temaPezzi'), get('colore'), continuaMossaMultiplayer, true);

function getScacchieraCorrente() {
    return sezioneCorrente === "giocaComputer" ? scacchieraGiocaComputer : sezioneCorrente === "giocaSolo" ? scacchieraGiocaSolo : scacchieraGiocaMultiplayer;
}

function aggiungiMossa(mossa) {
    let mosse = getScacchieraCorrente().partita.moves({ verbose: true });
    let num = getScacchieraCorrente().partita.history().length + 1;
    for (let i = 0; i < mosse.length; i++) {
        console.log(mosse[i]);
        if (mossa === mosse[i].from + mosse[i].to + (mosse[i].promotion ? mosse[i].promotion : '')) {
            mossa = mosse[i].san + (mosse[i].promotion ? mosse[i].promotion : '');
            break;
        }
    }
    let elem = document.getElementById(sezioneCorrente + "Mosse");
    if (elem.innerText === "") {
        elem.innerText = num + ") " + mossa;
    } else {
        elem.innerText += "\n" + num + ") " + mossa;
    }
}

function mostraTempoUtente(tempo) {
    document.getElementById("tempoUtente").innerText = tempo.toFixed(1);
    if (tempo < 0) {
        aggiornaStatoMultiplayer('terminata');
        sconfittaPartitaMultiplayer();
    }
}

function mostraTempoAvversario(tempo) {
    document.getElementById("tempoAvversario").innerText = tempo.toFixed(1);
    if (tempo < 0) {
        aggiornaStatoMultiplayer('terminata');
        vittoriaPartitaMultiplayer();
    }
}

// Aggiorna la scacchiera della sezione gioca
function aggiornaScacchieraGioca(idScacchiera, posizione = DEFAULT_POSITION_WHITE) {

    let scacchiera = idScacchiera === "scacchieraComputer" ? scacchieraGiocaComputer : idScacchiera === "scacchieraSolo" ? scacchieraGiocaSolo : scacchieraGiocaMultiplayer;

    if (sezioneCorrente !== "giocaMultiplayer" || modalitàMultiplayer === 'normale') {
        scacchiera.setSuggerimenti(true);
        scacchiera.setAnnebbia(false);
        scacchiera.cambiaTema(get('temaPezzi'), get('colore'));
    } else {
        scacchiera.setSuggerimenti(false);
        scacchiera.cambiaTema(get('temaPezzi'), get('colore'));
        if (modalitàMultiplayer === 'pezziNascosti') {
            scacchiera.setAnnebbia(false);
            scacchiera.cambiaTema('dama', get('colore'));
        } else if (modalitàMultiplayer === 'nebbia') {
            scacchiera.setAnnebbia(true);
        }
    }
    scacchiera.posizione(posizione, true);

    // Se inizia l'altro giocatore, aspetta la sua mossa
    if (coloreUtente === 'b') {
        scacchiera.ribalta();
        aspettaMossa(null, false);
    }
}

// Funzione per proseguire la mossa nella sezione gioca da solo
function continuaMossaSolo(mossa) {

    aggiungiMossa(mossa);

    setTimeout(function () {
        if (scacchieraGiocaSolo.statoPartita() !== null) {
            messaggioSolo.innerText = "Partita terminata!";
            return false;
        }

        scacchieraGiocaSolo.ribalta();

    }, 200);

    return true
}

// Funzione per proseguire la mossa nella sezione gioca contro il computer
function continuaMossaComputer(mossa) {

    aggiungiMossa(mossa);

    setTimeout(function () {

        if (scacchieraGiocaComputer.statoPartita() !== null) {
            messaggioComputer.innerText = scacchieraGiocaComputer.statoPartita() === 'p' ? "Patta!" : scacchieraGiocaComputer.statoPartita() === 'b' ? "Hai perso!" : "Hai vinto!";
            return false;
        }

        stockfish.postMessage('uci');
        stockfish.postMessage(`setoption name Skill Level value ${get('eloStockfish') / 4000 * 20}`);
        stockfish.postMessage(`position fen ${scacchieraGiocaComputer.partita.fen()}`);
        stockfish.postMessage('go depth 10');

        stockfish.onmessage = function (event) {
            if (event.data.startsWith('bestmove')) {
                mossa = event.data.split(' ')[1];
                aggiungiMossa(mossa);
                scacchieraGiocaComputer.eseguiMossa(mossa);
                if (scacchieraGiocaComputer.statoPartita() !== null) {
                    messaggioComputer.innerText = scacchieraGiocaComputer.statoPartita() === 'p' ? "Patta!" : scacchieraGiocaComputer.statoPartita() === 'b' ? "Hai perso!" : "Hai vinto!";
                }
            }
        };
    }, 500);

    return true
}

// Funzione per proseguire la mossa nella sezione gioca Multiplayer
function continuaMossaMultiplayer(mossa) {
    aggiungiMossa(mossa);
    setTimeout(() => aspettaMossa(mossa), 0);
    return true;
}

// Invia la mossa al server e aspetta la mossa dell'avversario
async function aspettaMossa(mossa, invia = true) {

    // Se la mossa è null, invia solo la richiesta
    if (invia) {
        await inviaDatiAlServer({
            operazione: 'faiMossa',
            mossa: mossa,
            codice: codicePartita,
        });
        if (!aggiornaStatoMultiplayer('turnoAvversario')) return;
    }

    if (codicePartita === null) return aggiornaStatoMultiplayer('annullata');

    // Invia la richiesta
    let datiRicevuti = await inviaDatiAlServer({
        operazione: 'aspettaMossa',
        codice: codicePartita
    });

    // Se la partita è stata annullata, aggiorna lo stato
    if (datiRicevuti['annullata']) {
        aggiornaStatoMultiplayer('annullata');
    } else if (datiRicevuti['mossa'] === mossa) {
        setTimeout(() => aspettaMossa(mossa, false), tempIntervallo);
    } else {
        aggiungiMossa(datiRicevuti['mossa']);
        scacchieraGiocaMultiplayer.eseguiMossa(datiRicevuti['mossa']);
        aggiornaStatoMultiplayer('mioTurno');
    }
}

// Funzione per aspettare che i giocatori si uniscano alla partita
async function aspettaGiocatori(protezione) {

    // Se la partita non è stata già iniziata
    if (protezione !== false) {

        // Invia i dati al server e ottieni il codice della partita
        let datiRicevuti = await inviaDatiAlServer({
            operazione: 'creaPartita',
            username: get('username'),
            protezione: protezione
        });
        codicePartita = datiRicevuti['codice'];
        coloreUtente = datiRicevuti['colore'];
        partitaInit = datiRicevuti['iniziata'];
        aggiornaStatoMultiplayer(partitaInit ? 'iniziata' : 'ricerca');
    }

    // Invia la richiesta al server e aspetta la risposta
    let datiRicevuti = await inviaDatiAlServer({
        operazione: 'aspettaGiocatori',
        username: get('username'),
        codice: codicePartita
    });

    // Se la partita è stata annullata, aggiorna lo stato
    if (datiRicevuti['annullata']) return aggiornaStatoMultiplayer('annullata');

    // Se la partita è iniziata, aggiorna lo stato e la scacchiera
    if (partitaInit || datiRicevuti['iniziata']) {
        aggiornaStatoMultiplayer('iniziata');
        aggiornaScacchieraGioca(idScacchieraCorrente);
        return;
    }

    // Altrimenti, aspetta un secondo e ripeti
    setTimeout(() => aspettaGiocatori(false), tempIntervallo);
}

// Funzione per creare una partita e aspettare i giocatori
function creaPartitaeAspetta(protezione) {
    aspettaGiocatori(protezione);
    aggiornaStatoMultiplayer('ricerca');
}

// Mostra la modalità di gioco selezionata
function mostraSezioneGioca(sezione) {

    // Nasconde tutti i bottoni
    document.getElementById("giocaComputer").style.display = "none";
    document.getElementById("giocaSolo").style.display = "none";
    document.getElementById("giocaMultiplayer").style.display = "none";

    // Mostra la sezione selezionata e imposta la sezione corrente
    document.getElementById(sezione).style.display = "block";
    sezioneCorrente = sezione;
    idScacchieraCorrente = sezioneCorrente === "giocaComputer" ? "scacchieraComputer" : sezioneCorrente === "giocaSolo" ? "scacchieraSolo" : "scacchieraMultiplayer";

    // Se la sezione è Multiplayer, aggiorna lo stato senza cambiare la scacchiera
    if (sezioneCorrente === "giocaMultiplayer") return aggiornaStatoMultiplayer('default');

    // Aggiorna la scacchiera
    aggiornaScacchieraGioca(idScacchieraCorrente)
}

function vittoriaPartitaMultiplayer() {
    messaggioMultiplayer.innerText = "Hai vinto!";
}

function sconfittaPartitaMultiplayer() {
    messaggioMultiplayer.innerText = "Hai perso!";
}

function pattaPartitaMultiplayer() {
    messaggioMultiplayer.innerText = "Patta!";
}

// Aggiorna lo stato della partita Multiplayer
function aggiornaStatoMultiplayer(stato = 'default') {
    let fine;
    switch (stato) {
        case 'default':
            aggiornaScacchieraGioca(idScacchieraCorrente, '');
            document.getElementById("messaggioMultiplayer").innerText = "Benvenuto nella sezione Multiplayer! Clicca su 'Nuova Partita' per iniziare! Puoi giocare con un avversario casuale o con un amico inserendo un codice!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            buttStopRicercaMultiplayer.style.display = "none";
            document.getElementById("codiceMultiplayer").value = "";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttNuovaPartitaMultiplayer.style.display = "block";
            break;
        case 'iniziata':
            document.getElementById("messaggioMultiplayer").innerText = "Partita iniziata!";
            partitaInit = true;
            document.getElementById("codiceMultiplayer").value = "";
            buttNuovaPartitaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "block";
            buttStopRicercaMultiplayer.style.display = "none";
            timerUtente.start();
            timerUtente.pausa();
            timerAvversario.start();
            timerAvversario.pausa();
            mostraTempoAvversario(60);
            mostraTempoUtente(60);
            break;
        case 'terminata':
            timerUtente.stop();
            timerAvversario.stop();
            scacchieraGiocaMultiplayer.termina();
            document.getElementById("messaggioMultiplayer").innerText = "Partita terminata!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            document.getElementById("codiceMultiplayer").value = "";
            buttStopRicercaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttNuovaPartitaMultiplayer.style.display = "block";
            break;
        case 'annullata':
            timerUtente.stop();
            timerAvversario.stop();
            document.getElementById("messaggioMultiplayer").innerText = "Partita annullata!";
            partitaInit = false;
            codicePartita = null;
            coloreUtente = null;
            document.getElementById("codiceMultiplayer").value = "";
            buttStopRicercaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttNuovaPartitaMultiplayer.style.display = "block";
            break;
        case 'ricerca':
            aggiornaScacchieraGioca(idScacchieraCorrente, '');
            document.getElementById("messaggioMultiplayer").innerText = "In attesa di un avversario...";
            buttNuovaPartitaMultiplayer.style.display = "none";
            buttTerminaPartitaMultiplayer.style.display = "none";
            buttStopRicercaMultiplayer.style.display = "block";
            mostraTempoAvversario(0);
            mostraTempoUtente(0);
            break;
        case 'mioTurno':
            fine = scacchieraGiocaMultiplayer.statoPartita();
            timerUtente.riprendi();
            timerAvversario.pausa();
            if (fine !== null) {
                let colore = coloreUtente;
                aggiornaStatoMultiplayer('terminata');
                fine === colore ? vittoriaPartitaMultiplayer() : colore === 'p' ? pattaPartitaMultiplayer() : sconfittaPartitaMultiplayer();

                inviaDatiAlServer({
                    operazione: 'finePartita',
                    codice: codicePartita
                });
                return false;
            }
            document.getElementById("messaggioMultiplayer").innerText = "Il tuo turno!";
            return true;
        case 'turnoAvversario':
            fine = scacchieraGiocaMultiplayer.statoPartita();
            timerUtente.pausa();
            timerAvversario.riprendi();
            if (fine !== null) {
                let colore = coloreUtente;
                aggiornaStatoMultiplayer('terminata');
                fine === colore ? vittoriaPartitaMultiplayer() : colore === 'p' ? pattaPartitaMultiplayer() : sconfittaPartitaMultiplayer();
                return false;
            }
            document.getElementById("messaggioMultiplayer").innerText = "Turno dell'avversario...";
            return true
        default:
            break;
    }
}

function annullaRicercaMultiplayer() {
    inviaDatiAlServer({
        operazione: 'annullaPartita',
        username: get('username'),
        codice: codicePartita
    });
}

function nuovaPartitaMultiplayer() {

    modalitàMultiplayer = document.getElementById("modalitàMultiplayer").value;
    let password = document.getElementById("codiceMultiplayer").value;

    if (get('username') === null) {
        document.getElementById("messaggioMultiplayer").innerText = "Devi essere loggato per giocare!";
    } else {
        creaPartitaeAspetta(modalitàMultiplayer + password);
    }
}

function terminaPartitaMultiplayer() {
    inviaDatiAlServer({
        operazione: 'finePartita',
        codice: codicePartita
    });
    aggiornaStatoMultiplayer('terminata');
}

mostraSezioneGioca("giocaComputer");
buttNuovaPartitaComputer.addEventListener("click", () => mostraSezioneGioca("giocaComputer"));
buttNuovaPartitaSolo.addEventListener("click", () => mostraSezioneGioca("giocaSolo"));
buttStopRicercaMultiplayer.addEventListener("click", () => annullaRicercaMultiplayer());
buttNuovaPartitaMultiplayer.addEventListener("click", () => nuovaPartitaMultiplayer());
buttTerminaPartitaMultiplayer.addEventListener("click", () => terminaPartitaMultiplayer());
eloStockfish.oninput = () => {
    set('eloStockfish', eloStockfish.value);
    document.getElementById("valoreEloStockfish").innerText = eloStockfish.value;
}


// Seleziona tutti gli elementi con la classe 'miaClasse'
var elementi = document.getElementsByClassName('modalitàGioca');

// Aggiungi il listener a ciascun elemento
for (var i = 0; i < elementi.length; i++) {
    elementi[i].addEventListener('change', function () {
        mostraSezioneGioca(this.value);
    });
}
