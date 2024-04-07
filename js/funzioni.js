function bloccaMossa(pezzo, partita) {
    if ((partita.turn() === 'w' && pezzo.search(/^b/) !== -1) || (partita.turn() === 'b' && pezzo.search(/^w/) !== -1)) return false
    return true;
}

function mostraSuggerimenti(args, partita, getCasellaCliccata, idScacchiera) {
    if (getCasellaCliccata()) return;
    rimuoviSuggerimenti()
    let mosse = getMossePossibili(partita, args['square']);
    if (mosse.length === 0) return;
    mosse.forEach(mossa => {
        coloraCasella(mossa.to, idScacchiera);
    });
}

function gestisciClick(args, partita, scacchiera, getCasellaCliccata, onDrop, setCasellaCliccata, idScacchiera) {
    if (args['square'] == null) return null;
    let pezzoPosseduto = partita.get(args['square']) !== null && partita.get(args['square'])['color'] === partita.turn();
    rimuoviSuggerimenti();
    if (getCasellaCliccata() !== null && !pezzoPosseduto) {
        onDrop({ 'source': getCasellaCliccata(), 'target': args['square'] });
        setCasellaCliccata(null);
    } else {
        if (pezzoPosseduto) setCasellaCliccata(null);
        mostraSuggerimenti(args, partita, getCasellaCliccata, idScacchiera);
        mosse = getMossePossibili(partita, args['square']);
        setCasellaCliccata(pezzoPosseduto && mosse.length > 0 ? args['square'] : null);
    }
}

function eseguiMossa(mossa, partita, scacchiera) {
    partita.move({
        from: mossa.slice(0, 2),
        to: mossa.slice(2, 4),
        promotion: 'q'
    });
    scacchiera.position(partita.fen(), 'slow');
}

function getMossePossibili(partita, casella, verbose = true) {
    return partita.moves({
        square: casella,
        verbose: verbose
    });
}

function rimuoviSuggerimenti() {
    document.querySelectorAll('[data-square-coord]').forEach(casella => {
        casella.style.backgroundColor = '';
    });
}

function coloraCasella(casella, idScacchiera) {
    const $casella = document.querySelector('#' + idScacchiera + ' [data-square-coord="' + casella + '"]')

    let colore = '#a9a9a9'
    if ($casella.classList.contains('black-b7cb6')) colore = '#696969';

    $casella.style.backgroundColor = colore;
}

// function isCasellaColorata(casella, idScacchiera) {
//     const $casella = document.querySelector('#' + idScacchiera + ' [data-square-coord="' + casella + '"]');
//     return $casella.style.backgroundColor === '#a9a9a9' || $casella.style.backgroundColor === '#696969';
// }

function isPezzoBianco(pezzo) { return /^w/.test(pezzo) }
function isPezzoNero(pezzo) { return /^b/.test(pezzo) }
