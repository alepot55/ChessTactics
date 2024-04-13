coloriScacchiera = {
    'default': {
        'chiaro': '#f0d9b5',
        'scuro': '#b58863'
    },
    'verde': {
        'chiaro': '#9ee0bc',
        'scuro': '#00ad88'
    },
    'blu': {
        'chiaro': '#7dd3e2',
        'scuro': '#277ece'
    }
}

DEFAULT_POSITION_WHITE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
DEFAULT_POSITION_BLACK = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'

class Scacchiera {

    colori = {
        'ombra': { 'scuro': '#696969', 'chiaro': '#a9a9a9' },
        'selezione': { 'scuro': '#ffef82', 'chiaro': '#ffef82' },
        'nebbia': { 'scuro': '#4d5358', 'chiaro': '#6a7278' },
    };

    constructor(id_div, posizione, orientamento, temaPezzi, temaCelle, onMossa, suggerimenti = true, annebbia = false) {

        let turno = posizione.split(' ')[1];
        this.orientamento = orientamento ? turno : turno === 'w' ? 'b' : 'w';
        this.partita = Chess(posizione);

        this.scacchiera = document.getElementById(id_div);
        this.colori['tema'] = coloriScacchiera[temaCelle];
        this.temaPezzi = temaPezzi;
        this.onMossa = onMossa;
        this.suggerimenti = suggerimenti;
        this.nebbia = annebbia;
        this.terminata = false;

        this.casellaCliccata = null;
        this.celle = {};
        this.pezzi = {};

        this._creaScacchiera();
        if (this.nebbia) this.annebbia();
        this._posizionaPezzi();
        this._aggiungiListener();
    }

    _aggiungiListener() {
        for (let casella in this.celle) {
            let cella = this.celle[casella];
            cella.addEventListener("mouseover", () => this.onOver(casella));
            cella.addEventListener("click", () => this.onClick(casella));
        }
    }

    coloraCasella(casella, colore) {
        if (!this.suggerimenti && colore === 'ombra' || casella == null) return;
        this.celle[casella].style.backgroundColor = this.colori[colore][(this.getPosizioneCella(casella)[0] + this.getPosizioneCella(casella)[1]) % 2 === 1 ? 'scuro' : 'chiaro'];
    }

    getPosizioneCella(casella) {
        return [this.colonne.indexOf(casella[0]), this.righe.indexOf(casella[1])];
    }

    rimuoviSuggerimenti() {
        if (!this.suggerimenti) return;
        for (let casella in this.celle) {
            this.coloraCasella(casella, 'tema');
        }
    }

    possiedo(casella) {
        return this.partita.get(casella) !== null && this.partita.get(casella)['color'] === this.orientamento;
    }

    mostraSuggerimenti(casella) {
        let mosse = this.partita.moves({ square: casella, verbose: true });
        for (let mossa of mosse) {
            this.coloraCasella(mossa['to'], 'ombra');
        }
    }

    mossaLegale(mossa) {
        let partita = this.nebbia ? this.partitaVisualizzata : this.partita;
        let mosseLegali = partita.moves({ square: mossa.slice(0, 2), verbose: true }).map(m => m['from'] + m['to']);
        if (this.nebbia) return !this.celleAnnebbiate.includes(mossa.slice(2, 4)) && mosseLegali.includes(mossa);
        return mosseLegali.includes(mossa);
    }

    annebbia() {
        let posizione = this.partita.fen();
        posizione = posizione.replace('+', '');
        if (posizione.split(' ')[1] !== this.orientamento) {
            let parti = posizione.split(' ');
            parti[1] = this.orientamento;
            parti[3] = '-';
            posizione = parti.join(' ');
        }
        this.partitaVisualizzata = Chess(posizione);

        let caselleAccessibili = this.mossePossibili().map(m => m['to']);
        let caselleOccupate = []

        for (let casella in this.celle) {
            if (!caselleAccessibili.includes(casella) && !this.possiedo(casella) && this.partita.get(casella) !== null) {
                this.partitaVisualizzata.remove(casella);
                caselleOccupate.push(casella);
            }
        }

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

    setAnnebbia(flag) {
        this.nebbia = flag;
    }

    eseguiMossa(mossa) {
        let res = this.partita.move({ from: mossa.slice(0, 2), to: mossa.slice(2, 4), promotion: 'q' });
        if (res == null && this.nebbia) {
            let pezzoDaMuovere = this.partita.remove(mossa.slice(0, 2))
            this.partita.remove(mossa.slice(2, 4));
            this.partita.put(pezzoDaMuovere, mossa.slice(2, 4));
            this.partitaVisualizzata.remove(mossa.slice(0, 2));
            this.partitaVisualizzata.remove(mossa.slice(2, 4));
            this.partitaVisualizzata.put(pezzoDaMuovere, mossa.slice(2, 4));
            let posizione = this.partita.fen();
            let parti = posizione.split(' ');
            parti[1] = this.partita.turn() === 'w' ? 'b' : 'w';
            posizione = parti.join(' ');
            this.partita = Chess(posizione);
            posizione = this.partitaVisualizzata.fen();
            parti = posizione.split(' ');
            parti[1] = this.partita.turn() === 'w' ? 'b' : 'w';
            posizione = parti.join(' ');
            this.partitaVisualizzata = Chess(posizione);
        }
        this._rimuoviPezzi();
        if (this.nebbia && this.statoPartita() === null) this.annebbia();
        this._posizionaPezzi();
    }

    onOver(casella) {
        if (this.casellaCliccata !== null || this.orientamento !== this.partita.turn()) return;
        this.rimuoviSuggerimenti();
        this.mostraSuggerimenti(casella);
    }

    onClick(casella) {
        console.log(this.terminata);
        console.log(this.partita.turn());
        console.log(this.orientamento);
        if (this.partita.turn() !== this.orientamento || this.terminata) return;
        let posseduto = this.possiedo(casella);
        this.coloraCasella(this.casellaCliccata, 'tema');
        this.rimuoviSuggerimenti();
        if (this.casellaCliccata !== null && !posseduto) {
            let mossa = this.casellaCliccata + casella;
            this.casellaCliccata = null;
            if (!this.mossaLegale(mossa)) return;
            if (this.onMossa(mossa)) this.eseguiMossa(mossa);
        } else {
            if (posseduto) {
                this.coloraCasella(casella, 'selezione');
                this.casellaCliccata = casella;
            } else {
                this.casellaCliccata = null;
            }
            this.mostraSuggerimenti(casella);
        }
    }

    termina() {
        this.terminata = true;
    }

    // Crea la scacchiera HTML
    _creaScacchiera() {
        this.colonne = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
        this.righe = ['1', '2', '3', '4', '5', '6', '7', '8'];
        if (this.orientamento === "w") {
            this.colonne.reverse();
            this.righe.reverse();
        }

        this.scacchiera.style.display = "grid";
        this.scacchiera.style.gridTemplate = "repeat(8, 1fr) / repeat(8, 1fr)";
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cella = this._creaCella(i, j);
                this.celle[cella.id] = cella;
                this.coloraCasella(cella.id, 'tema');
                this.scacchiera.appendChild(cella);
            }
        }
    }

    _creaCella(riga, colonna) {
        let id = this.colonne[colonna] + this.righe[riga];
        let cella = document.createElement("div");
        cella.id = id;
        cella.style.width = "50px";
        cella.style.height = "50px";
        cella.style.display = "flex";
        cella.style.alignItems = "center";
        cella.style.justifyContent = "center";
        return cella;
    }

    // Posiziona i pezzi sulla scacchiera
    _posizionaPezzi() {
        for (let casella in this.celle) {
            let partita = this.nebbia ? this.partitaVisualizzata : this.partita;
            let pezzo = partita.get(casella);
            if (pezzo !== null) {
                pezzo = pezzo['type'] + pezzo['color'];
                let percorso = 'assets/pedine/' + this.temaPezzi + '/' + pezzo + '.svg';
                let img = document.createElement("img");
                img.style.width = "45px";
                img.style.height = "45px";
                img.src = percorso;
                this.pezzi[casella] = { 'img': img, 'pezzo': pezzo };
                this.celle[casella].appendChild(img);
            }
        }
    }

    _rimuoviCelle() {
        for (let casella in this.celle) {
            this.scacchiera.removeChild(this.celle[casella]);
        }
        this.celle = {};
    }

    // Modifica la posizione dei pezzi sulla base di una FEN
    posizione(posizione, orientamento = true) {
        this.terminata = false;
        this._rimuoviPezzi();
        this._rimuoviCelle();
        let turno = posizione.split(' ')[1];
        this.orientamento = orientamento ? turno : turno === 'w' ? 'b' : 'w';
        this.partita = Chess(posizione);
        this._creaScacchiera();
        if (this.nebbia) this.annebbia();
        this._posizionaPezzi();
        this._aggiungiListener();
    }

    cambiaTema(nuovoTemaPezzi, nuovoTemaCelle) {
        this.temaPezzi = nuovoTemaPezzi;
        this.colori['tema'] = coloriScacchiera[nuovoTemaCelle];
        for (let casella in this.pezzi) {
            let percorso = 'assets/pedine/' + this.temaPezzi + '/' + this.pezzi[casella]['pezzo'] + '.svg';
            this.pezzi[casella]['img'].src = percorso;
        }
        for (let casella in this.celle) {
            this.coloraCasella(casella, 'tema');
        }
    }

    _rimuoviPezzi() {
        for (let casella in this.celle) {
            let cella = this.celle[casella];
            while (cella.firstChild) {
                cella.removeChild(cella.firstChild);
            }
        }
        this.pezzi = {};
    }

    ribalta() {
        this.orientamento = this.orientamento === 'w' ? 'b' : 'w';
        this._rimuoviPezzi();
        this._rimuoviCelle();
        this._creaScacchiera();
        if (this.nebbia) this.annebbia();
        this._posizionaPezzi();
        this._aggiungiListener();
    }

    setSuggerimenti(flag) {
        this.suggerimenti = flag;
    }

    mossePossibili(casella = null) {
        let partita = this.nebbia ? this.partitaVisualizzata : this.partita;
        if (casella === null) {
            return partita.moves({ verbose: true });
        } else {
            return partita.moves({ square: casella, verbose: true });
        }
    }

    statoPartita() {
        if (this.nebbia) {
            if (this.partita.fen() === '') return null;
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
            if (this.partita.in_checkmate()) return this.partita.turn() === 'w' ? 'b' : 'w';
            return 'p';
        }
        return null;
    }
}
