const coloriTemaCelle = {
    'default': 30,
    'verde': 120,
    'simple': 220,
}

const DEFAULT_POSITION_WHITE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const DEFAULT_POSITION_BLACK = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'

class Scacchiera {

    // Colori della scacchiera
    colori = {
        'nebbia': { 'scuro': '#4d5358', 'chiaro': '#6a7278' },
    };

    // Rapporto tra la dimensione della scacchiera e la dimensione dei pezzi
    rapportoDimensioniPezzi = {
        'default': 0.75,
        'marshmallow': 0.8,
        'horsey': 0.9,
        'simple': 0.75,
        'verde': 0.75,
        'dama': 0.9,
    };

    font = "'Roboto', sans-serif";


    constructor(id_div, posizione, orientamento, temaPezzi = 'simple', temaCelle = 'simple', onMossa, suggerimenti = true, annebbia = false) {

        // Inizializza la posizione della scacchiera e l'orientamento
        let turno = posizione.split(' ')[1];
        this.orientamento = orientamento ? turno : turno === 'w' ? 'b' : 'w';
        this.partita = Chess(posizione);

        // Imposta le impostazioni della scacchiera
        this.temaCelle = temaCelle;
        this.temaPezzi = temaPezzi;
        this.onMossa = onMossa;
        this.suggerimenti = suggerimenti;
        this.nebbia = annebbia;
        this.terminata = false;

        // Inizializza le variabili della scacchiera
        this.casellaCliccata = null;
        this.celle = {};
        this.pezzi = {};

        // Crea la tavola e la scacchiera
        this.aggiorna(id_div);
    }

    impostaColori(temaCelle = this.temaCelle) { // Imposta i colori della scacchiera
        this.colore = coloriTemaCelle[temaCelle];
        this.colori['tema'] = { 'scuro': 'hsl(' + this.colore + ', 30%, 78%)', 'chiaro': 'hsl(' + this.colore + ', 59%, 94%)' };
        this.colori['selezione'] = { 'scuro': 'hsl(' + ((this.colore + 30) % 360) + ', 71%, 75%)', 'chiaro': 'hsl(' + ((this.colore + 30) % 360) + ', 93%, 82%)' };
        this.colori['ombra'] = { 'scuro': 'hsl(' + ((this.colore + 30) % 360) + ', 93%, 84%)', 'chiaro': 'hsl(' + ((this.colore + 30) % 360) + ', 92%, 85%)' };
        this.colori['suggerimento'] = this.colori['selezione']['scuro'];

        if (modNotte) {
            this.colori['tavola'] = 'hsl(' + this.colore + ', 19%, 25%)';
            this.colori['text'] = 'white';
        } else {
            this.colori['tavola'] = 'white';
            this.colori['text'] = 'black';
        }
    }

    impostaDimensioni(altezza) { // Imposta le dimensioni della scacchiera e delle componenti
        this.dimensioneTavolaAltezza = altezza;
        this.dimensioneTavolaLarghezza = this.dimensioneTavolaAltezza * 0.98;
        this.dimensioneScacchieraAltezza = this.dimensioneTavolaAltezza * 0.94;
        this.dimensioneScacchieraLarghezza = this.dimensioneTavolaLarghezza * 0.94;
        this.dimensioneCellaAltezza = this.dimensioneScacchieraAltezza / 8;
        this.dimensioneCellaLarghezza = this.dimensioneScacchieraLarghezza / 8;
        this.dimensioneBordo = this.dimensioneScacchieraAltezza / 45;
        this.dimensioneNumeri = this.dimensioneScacchieraAltezza * 0.022;
        this.dimensioneTesto = this.dimensioneScacchieraAltezza * 0.021;

        this.posizioneRighe = (this.dimensioneTavolaLarghezza - this.dimensioneScacchieraLarghezza) / 2 - this.dimensioneScacchieraLarghezza / 55;
        this.posizioneColonne = (this.dimensioneTavolaAltezza - this.dimensioneScacchieraAltezza) / 2 - this.dimensioneScacchieraAltezza / 37;
    }

    aggiorna(id_div = this.tavola.id, altezza = 600) { // Inizializza la scacchiera
        this.terminata = false;
        this._rimuoviPezzi();
        this._rimuoviCelle();
        while (this.tavola && this.tavola.firstChild) this.tavola.removeChild(this.tavola.firstChild);
        this.impostaColori();
        this.impostaDimensioni(altezza);
        this.impostaColori();
        this.creaTavola(id_div);
        this._creaScacchiera();
        if (this.nebbia) this.annebbia();
        this._posizionaPezzi();
        this._aggiungiListener();
        if (this.statoPartita() !== null) this.termina();
    }

    creaTavola(id_div) { // Crea la tavola e la scacchiera con le lettere delle colonne e i numeri delle righe

        // Inizializza le colonne e le righe della scacchiera
        this.colonne = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
        this.righe = ['1', '2', '3', '4', '5', '6', '7', '8'];
        if (this.orientamento === "w") {
            this.colonne.reverse();
            this.righe.reverse();
        }

        // Crea un nuovo elemento div per la tavola
        this.tavola = document.getElementById(id_div);
        this.tavola.style.width = this.dimensioneTavolaLarghezza + "px";
        this.tavola.style.height = this.dimensioneTavolaAltezza + "px";
        this.tavola.style.background = this.colori['tavola'];
        this.tavola.style.borderRadius = "10px";
        this.tavola.style.border = this.dimensioneBordo + "px solid " + this.colori['tavola'];
        this.tavola.style.borderRadius = "10px";
        this.tavola.style.display = "flex";
        this.tavola.style.justifyContent = "flex-end";
        this.tavola.style.position = "relative";

        // Crea un nuovo elemento div per la scacchiera e aggiungilo alla tavola
        this.scacchiera = document.createElement("div");
        this.scacchiera.style.width = this.dimensioneScacchieraLarghezza + "px";
        this.scacchiera.style.height = this.dimensioneScacchieraAltezza + "px";
        this.tavola.appendChild(this.scacchiera);

        // Crea un nuovo elemento div per i numeri delle righe
        var numeriRighe = document.createElement("div");
        numeriRighe.style.position = "absolute";
        numeriRighe.style.left = this.posizioneRighe + "px";
        numeriRighe.style.top = "0";
        numeriRighe.style.display = "flex";
        numeriRighe.style.flexDirection = "column";
        numeriRighe.style.justifyContent = "space-between";
        numeriRighe.style.height = this.dimensioneScacchieraAltezza + "px";

        // Aggiungi i numeri delle righe
        for (let riga of this.righe) {
            var numero = document.createElement("div");
            numero.textContent = riga;
            numero.style.display = "flex";
            numero.style.justifyContent = "center";
            numero.style.alignItems = "center";
            numero.style.height = this.dimensioneCellaAltezza + "px";
            numero.style.fontFamily = this.font;
            numero.style.fontWeight = "bold";
            numero.style.color = this.colori['text'];
            numero.style.fontSize = this.dimensioneNumeri + "px";
            numeriRighe.appendChild(numero);
        }

        // Aggiungi i numeri delle righe alla tavola
        this.tavola.appendChild(numeriRighe);

        // Crea un nuovo elemento div per le lettere delle colonne
        var lettereColonne = document.createElement("div");
        lettereColonne.style.position = "absolute";
        lettereColonne.style.right = "0";
        lettereColonne.style.bottom = this.posizioneColonne + "px";
        lettereColonne.style.display = "flex";
        lettereColonne.style.justifyContent = "space-between";
        lettereColonne.style.width = this.dimensioneScacchieraLarghezza + "px";

        // Aggiungi le lettere delle colonne
        for (let colonna of this.colonne) {
            var lettera = document.createElement("div");
            lettera.textContent = colonna.toUpperCase();
            lettera.style.display = "flex";
            lettera.style.justifyContent = "center";
            lettera.style.alignItems = "center";
            lettera.style.width = this.dimensioneCellaLarghezza + "px";
            lettera.style.fontFamily = this.font;
            lettera.style.fontWeight = "bold";
            lettera.style.color = this.colori['text'];
            lettera.style.fontSize = this.dimensioneTesto + "px";
            lettereColonne.appendChild(lettera);
        }

        // Aggiungi le lettere delle colonne alla tavola
        this.tavola.appendChild(numeriRighe);
        this.tavola.appendChild(lettereColonne);
    }

    _aggiungiListener() { // Aggiunge i listener per il movimento del mouse e il click sulle caselle
        for (let casella in this.celle) {
            let cella = this.celle[casella];
            cella.addEventListener("mouseover", () => this.onOver(casella));
            cella.addEventListener("click", () => this.onClick(casella));
        }
    }

    coloraCasella(casella, tema) { // Colora la casella in base al tema
        if (!casella) return;
        this.celle[casella].style.backgroundColor = this.colori[tema][(this.getPosizioneCella(casella)[0] + this.getPosizioneCella(casella)[1]) % 2 === 1 ? 'scuro' : 'chiaro'];
    }

    getPosizioneCella(casella) { // Restituisce la posizione della casella nella scacchiera
        return [this.colonne.indexOf(casella[0]), this.righe.indexOf(casella[1])];
    }

    rimuoviSuggerimenti() { // Rimuove i suggerimenti dalle caselle 
        if (!this.suggerimenti) return;
        for (let casella in this.celle) {
            let cella = this.celle[casella];
            var figli = cella.childNodes;

            // Itera all'indietro attraverso la lista dei figli
            for (var i = figli.length - 1; i >= 0; i--) {
                // Se il figlio è un 'div', rimuovilo
                if (figli[i].nodeName === 'DIV') {
                    cella.removeChild(figli[i]);
                }
            }

        }
    }

    possiedo(casella) { // Restituisce true se la casella è occupata da un pezzo del giocatore
        return this.partita.get(casella) !== null && this.partita.get(casella)['color'] === this.orientamento;
    }

    mostraSuggerimenti(casella) { // Mostra i suggerimenti per le mosse possibili
        let mosse = this.partita.moves({ square: casella, verbose: true });
        for (let mossa of mosse) {
            this.suggerimento(mossa['to']);
        }
    }

    mossaLegale(mossa) { // Restituisce true se la mossa è legale
        let partita = this.nebbia ? this.partitaVisualizzata : this.partita;
        let mosseLegali = partita.moves({ square: mossa.slice(0, 2), verbose: true }).map(m => m['from'] + m['to']);
        if (this.nebbia) return !this.celleAnnebbiate.includes(mossa.slice(2, 4)) && mosseLegali.includes(mossa);
        return mosseLegali.includes(mossa);
    }

    annebbia() { // Annebbia le caselle non accessibili nella modalità nebbia

        // Se c'è solo un re, non annebbiare le caselle perché la partita è terminata
        let k = 0;
        for (let casella in this.celle) {
            if (this.partita.get(casella) === null) continue;
            else if ('k' === this.partita.get(casella)['type']) k = k + 1;
        }
        if (k === 1) {
            this.termina();
            return;
        }

        // Imposta la posizione della partita visualizzata
        let posizione = this.partita.fen();

        // Rimuove lo scacco
        posizione = posizione.replace('+', '');

        // Cambia il turno
        if (posizione.split(' ')[1] !== this.orientamento) {
            let parti = posizione.split(' ');
            parti[1] = this.orientamento;
            parti[3] = '-';
            posizione = parti.join(' ');
        }

        // Imposta la posizione della partita visualizzata
        this.partitaVisualizzata = Chess(posizione);

        // Rimuove i pezzi dalle caselle non accessibili e salva le caselle occupate
        let caselleAccessibili = this.mossePossibili().map(m => m['to']);
        let caselleOccupate = []
        for (let casella in this.celle) {
            if (!caselleAccessibili.includes(casella) && !this.possiedo(casella) && this.partita.get(casella) !== null) {
                this.partitaVisualizzata.remove(casella);
                caselleOccupate.push(casella);
            }
        }

        // Colora le caselle accessibili e non accessibili e salva le caselle annebbiate
        caselleAccessibili = this.mossePossibili().map(m => m['to']);
        this.celleAnnebbiate = [];
        for (let casella in this.celle) {
            if ((!caselleAccessibili.includes(casella) && !this.possiedo(casella)) || caselleOccupate.includes(casella)) {
                this.coloraCasella(casella, 'nebbia');
                this.celleAnnebbiate.push(casella);
            } else {
                this.coloraCasella(casella, 'tema');
            }
        }
    }

    setAnnebbia(flag) { // Imposta la modalità nebbia
        this.nebbia = flag;
    }

    rimuoviSelezioni() { // Rimuove le selezioni dalle caselle
        for (let casella in this.celle) {
            this.coloraCasella(casella, 'tema');
        }
    }

    eseguiMossa(mossa) { // Esegue la mossa TODO: da rivedere quando la mossa non è legale in nebbia

        // RImuoce le selezioni dalle caselle
        this.rimuoviSelezioni();

        // Esegue la mossa 
        let res = this.partita.move({ from: mossa.slice(0, 2), to: mossa.slice(2, 4), promotion: mossa.length === 5 ? mossa[4] : undefined });

        // Se la mossa non è stata eseguita in nebbia
        if (res == null && this.nebbia) {

            // Rimuove i pezzi del giocatore avversario 
            let pezziRimossi = {};
            for (let casella in this.celle) {
                if (this.partita.get(casella) !== null && this.partita.get(casella)['color'] !== this.partita.turn() && this.partita.get(casella)['type'] !== 'k') {
                    pezziRimossi[casella] = this.partita.remove(casella);
                }
            }

            // Esegue la mossa nella partita visualizzata e nella partita
            this.partita.move({ from: mossa.slice(0, 2), to: mossa.slice(2, 4), promotion: mossa.length === 5 ? mossa[4] : undefined });
            this.partitaVisualizzata.move({ from: mossa.slice(0, 2), to: mossa.slice(2, 4), promotion: mossa.length === 5 ? mossa[4] : undefined });

            // Ripristina i pezzi rimossi
            for (let casella in pezziRimossi) {
                this.partita.put(pezziRimossi[casella], casella);
            }

            // Aggiorna la posizione della partita
            let nuovaFen = this.partita.fen().split(' ')[0];
            nuovaFen = [nuovaFen].concat(this.partitaVisualizzata.fen().split(' ').slice(1));
            nuovaFen = nuovaFen.join(' ');
            this.partita = Chess(nuovaFen);
        }

        // Aggiorna la scacchiera
        this.aggiorna();

        // Se la partita non è terminata, evidenzia la mossa
        if (!this.nebbia || this.terminata) {
            this.coloraCasella(mossa.slice(2, 4), 'ombra');
            this.coloraCasella(mossa.slice(0, 2), 'ombra');
        }
    }

    onOver(casella) { // Mostra i suggerimenti quando il mouse è sopra una casella
        if (this.casellaCliccata !== null || this.orientamento !== this.partita.turn()) return;
        this.rimuoviSuggerimenti();
        this.mostraSuggerimenti(casella);
    }

    promozione(mossa) { // Restituisce true se la mossa è una promozione
        let aCasella = mossa.slice(2, 4);
        let daCasella = mossa.slice(0, 2);

        // Se la mossa è una promozione e il pezzo è un pedone e la casella di arrivo è l'ultima riga
        let pezzo = this.partita.get(daCasella);
        if (pezzo['type'] === 'p' && ((aCasella[1] === '1' || aCasella[1] === '8'))) {

            // Per ogni cella
            for (let casella in this.celle) {

                // Crea un nuovo elemento div per la copertura della cella
                let coperturaCella = document.createElement("div");
                coperturaCella.style.width = this.dimensioneCellaLarghezza + "px";
                coperturaCella.style.height = this.dimensioneCellaAltezza + "px";
                coperturaCella.style.position = "absolute";
                coperturaCella.style.display = "flex";
                coperturaCella.style.alignItems = "center";
                coperturaCella.style.justifyContent = "center";

                let righePromozione = this.orientamento === 'w' ? ['8', '7', '6', '5'] : ['1', '2', '3', '4'];

                // Se la casella è nel riquadro della scelta del pezzo
                if (casella[0] === aCasella[0] && righePromozione.includes(casella[1])) {

                    // Imposta lo stile della copertura della cella e posizionala dava la casella
                    coperturaCella.style.zIndex = "2";
                    coperturaCella.style.backgroundColor = this.colori['selezione'][(this.getPosizioneCella(casella)[0] + this.getPosizioneCella(casella)[1]) % 2 === 1 ? 'scuro' : 'chiaro'];

                    // Crea un nuovo elemento img per il pezzo 
                    let temaPezzi = this.temaPezzi === 'dama' ? 'simple' : this.temaPezzi;
                    let dimensioneImg = this.rapportoDimensioniPezzi[temaPezzi] * this.dimensioneCellaLarghezza + "px"
                    let img = document.createElement("img");
                    img.style.width = dimensioneImg;
                    img.style.height = dimensioneImg;
                    img.style.position = "absolute";
                    img.style.zIndex = "3";

                    // Imposta il tipo del pezzo e il percorso dell'immagine
                    let pezzi = ['q', 'r', 'b', 'n'];
                    let tipo = pezzi[righePromozione.indexOf(casella[1])];
                    let percorso = 'assets/pedine/' + temaPezzi + '/' + tipo + this.orientamento + '.svg';

                    // Aggiungi l'immagine alla copertura della cella e aggiungi un listener per la promozione
                    img.src = percorso;
                    img.addEventListener("click", () => {
                        let mossa = daCasella + aCasella + tipo;
                        if (this.onMossa(mossa)) this.eseguiMossa(mossa);
                    });
                    coperturaCella.appendChild(img);
                } else {

                    // Imposta lo stile della copertura della cella per oscurare le caselle non selezionate
                    coperturaCella.style.zIndex = "0";
                    coperturaCella.style.backgroundColor = this.colori['nebbia'][(this.getPosizioneCella(casella)[0] + this.getPosizioneCella(casella)[1]) % 2 === 1 ? 'scuro' : 'chiaro'];
                }

                // Aggiungi la copertura della cella alla casella
                this.celle[casella].appendChild(coperturaCella);
            }
            return true;
        } else {
            return false;
        }
    }

    onClick(casella) { // Esegue la mossa quando si clicca su una casella

        // Se la partita è terminata o non è il turno del giocatore, non fare nulla
        if (this.partita.turn() !== this.orientamento || this.terminata) return;

        // Se la casella cliccata è la stessa della mossa precedente, deselezionarla e rimuovere i suggerimenti
        this.coloraCasella(this.casellaCliccata, 'tema');
        this.rimuoviSuggerimenti();

        // Se ci sono caselle selezionate e non possiedo la casella cliccata
        let posseduto = this.possiedo(casella);
        if (this.casellaCliccata !== null && !posseduto) {

            // Calcola la mossa e controlla se è legale
            let mossa = this.casellaCliccata + casella;

            if (!this.mossaLegale(mossa)) return;
            if (this.promozione(mossa)) return;

            this.casellaCliccata = null;

            // Esegui la mossa se accettata dalla funzione onMossa
            if (this.onMossa(mossa)) this.eseguiMossa(mossa);
        } else {

            // Se possiedo la casella cliccata, selezionarla
            if (posseduto) {
                this.coloraCasella(casella, 'selezione');
                this.casellaCliccata = casella;
            } else {
                this.casellaCliccata = null;
            }

            // Mostra i suggerimenti per le mosse possibili
            this.mostraSuggerimenti(casella);
        }
    }

    termina() { // Termina la partita
        this.terminata = true;
    }

    _creaScacchiera() {  // Crea la scacchiera con le caselle

        // Imposta lo stile della scacchiera
        this.scacchiera.style.display = "grid";
        this.scacchiera.style.gridTemplate = "repeat(8, 1fr) / repeat(8, 1fr)";

        // Crea le caselle della scacchiera
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cella = this._creaCella(i, j);
                this.celle[cella.id] = cella;
                this.coloraCasella(cella.id, 'tema');
                this.scacchiera.appendChild(cella);
            }
        }
    }

    _creaCella(riga, colonna) { // Crea una cella della scacchiera

        // Imposta l'id della cella e crea un nuovo elemento div
        let id = this.colonne[colonna] + this.righe[riga];
        let cella = document.createElement("div");
        cella.id = id;

        // Imposta lo stile della cella
        cella.style.width = this.dimensioneCellaLarghezza + "px";
        cella.style.height = this.dimensioneCellaAltezza + "px";
        cella.style.display = "flex";
        cella.style.alignItems = "center";
        cella.style.justifyContent = "center";

        return cella;
    }

    _posizionaPezzi() { // Posiziona i pezzi sulla scacchiera

        // Per ogni casella
        for (let casella in this.celle) {

            // Se la casella è occupata
            let partita = this.nebbia && !this.terminata ? this.partitaVisualizzata : this.partita;
            let pezzo = partita.get(casella);
            if (pezzo !== null) {

                // Crea un nuovo elemento img per il pezzo
                pezzo = pezzo['type'] + pezzo['color'];
                let percorso = 'assets/pedine/' + this.temaPezzi + '/' + pezzo + '.svg';
                let dimensioneImg = this.rapportoDimensioniPezzi[this.temaPezzi] * this.dimensioneCellaLarghezza + "px"
                let img = document.createElement("img");

                // Imposta lo stile del pezzo
                img.style.width = dimensioneImg;
                img.style.height = dimensioneImg;
                img.style.position = "absolute";
                img.style.zIndex = "1";
                img.src = percorso;

                // Aggiungi il pezzo alla casella
                this.pezzi[casella] = { 'img': img, 'pezzo': pezzo };
                this.celle[casella].appendChild(img);
            }
        }
    }

    _rimuoviCelle() { // Rimuove le caselle dalla scacchiera
        for (let casella in this.celle) {
            this.scacchiera.removeChild(this.celle[casella]);
        }
        this.celle = {};
    }

    suggerimento(casella) { // Mostra il suggerimento per una mossa possibile

        // Se i suggerimenti sono attivi e la casella è vuota
        if (this.suggerimenti) {

            // Crea un nuovo elemento div per il cerchio
            let cerchio = document.createElement("div");

            // Imposta lo stile del cerchio
            let dimensioneCerchio = this.dimensioneCellaLarghezza / 3.5 + "px";
            if (this.partita.get(casella) !== null) dimensioneCerchio = this.dimensioneCellaLarghezza * 0.9 + "px";
            cerchio.style.width = dimensioneCerchio;
            cerchio.style.height = dimensioneCerchio;
            cerchio.style.background = this.colori['suggerimento'];
            cerchio.style.borderRadius = "50%";
            cerchio.style.opacity = "0.8";
            cerchio.style.position = "absolute";
            cerchio.style.zIndex = "0";

            // Aggiunge il cerchio alla casella
            this.celle[casella].appendChild(cerchio);
        }
    }

    posizione(posizione, orientamento = true) { // Imposta la posizione della scacchiera

        // Imposta la posizione e l'orientamento
        let turno = posizione.split(' ')[1];
        this.orientamento = orientamento ? turno : turno === 'w' ? 'b' : 'w';
        this.partita = Chess(posizione);

        // Aggiorna la scacchiera
        this.aggiorna();
    }

    cambiaTema(nuovoTemaPezzi = 'simple', nuovoTemaCelle = 'simple') { // Cambia il tema dei pezzi e delle caselle

        // Imposta i nuovi temi
        this.temaPezzi = nuovoTemaPezzi;
        this.temaCelle = nuovoTemaCelle;

        // Aggiorna la scacchiera
        this.aggiorna();
    }

    _rimuoviPezzi() { // Rimuove i pezzi dalla scacchiera
        for (let casella in this.celle) {
            let cella = this.celle[casella];
            while (cella.firstChild) {
                cella.removeChild(cella.firstChild);
            }
        }
        this.pezzi = {};
    }

    ribalta() { // Ribalta la scacchiera e cambia l'orientamento
        this.orientamento = this.orientamento === 'w' ? 'b' : 'w';
        this.aggiorna();
    }

    setSuggerimenti(flag) { // Imposta i suggerimenti
        this.suggerimenti = flag;
    }

    mossePossibili(casella = null) { // Restituisce le mosse possibili

        // Se la modalità nebbia è attiva, restituisci le mosse possibili dalla partita visualizzata
        let partita = this.nebbia ? this.partitaVisualizzata : this.partita;

        // Restituisci le mosse possibili per la casella specificata o per la partita
        if (casella === null) {
            return partita.moves({ verbose: true });
        } else {
            return partita.moves({ square: casella, verbose: true });
        }
    }

    statoPartita() { // Restituisce lo stato della partita

        // Se la modalità nebbia è attiva
        if (this.nebbia) {
            if (this.partita.fen() === '') return null;

            // Se c'è solo un re, restituisci il vincitore
            let kb = false;
            let kw = false;
            for (let casella in this.celle) {
                if (this.partita.get(casella) === null) continue;
                else if ('kb' === this.partita.get(casella)['type'] + this.partita.get(casella)['color']) kb = true;
                else if ('kw' === this.partita.get(casella)['type'] + this.partita.get(casella)['color']) kw = true;
            }
            if (!kb) return 'w';
            if (!kw) return 'b';
        } else if (this.partita.game_over()) {

            // Se la partita è terminata, restituisci il vincitore
            if (this.partita.in_checkmate()) return this.partita.turn() === 'w' ? 'b' : 'w';
            return 'p';
        }
        return null;
    }
}
