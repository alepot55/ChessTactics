// le sezioni sono giocaComputer, giocaSolo, giocaRandom
// le scacchiere sono scacchieraComputer, scacchieraSolo, scacchieraRandom

var sezioneCorrente = "giocaComputer";
var scacchieraCorrente = "scacchieraComputer";
var casellaCliccata = null;
DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
var scacchieraGioca = null;
var partitaGioca = null;

function setCasellaCliccata(casella) {
    casellaCliccata = casella;
}

function getCasellaCliccata() {
    return casellaCliccata;
}

function aggiornaScacchieraGioca(scacchiera, posizione = DEFAULT_POSITION) {
    partitaGioca = new Chess(posizione);
    scacchieraGioca = new Chessboard2(scacchiera, {
        position: partitaGioca.fen(),
        draggable: true,
        trashSpeed: 'slow',
        orientation: partitaGioca.turn() === 'w' ? 'white' : 'black',
        onDragStart: onDragStartGioca,
        onMouseenterSquare: onMouseEnterSquareGioca,
        onMousedownSquare: onMousedownSquareGioca,
        onDrop: onDropGioca,

    });
}

function onDragStartGioca(args) {
    return bloccaMossa(args['piece'], partitaGioca);
}

function onMouseEnterSquareGioca(args) {
    
    mostraSuggerimenti(args, partitaGioca, getCasellaCliccata, scacchieraCorrente);
}

function onMousedownSquareGioca(args) {
    gestisciClick(args, partitaGioca, scacchieraGioca, getCasellaCliccata, onDropGioca, setCasellaCliccata, scacchieraCorrente);
}

function onDropGioca(args) {
    let mosseLegali = partitaGioca.moves({
        square: args['source'],
        verbose: true
    });
    if (!mosseLegali.some(mossaLegale => mossaLegale.to === args['target'])) {
        return 'snapback';
    } else {
        rimuoviSuggerimenti()
        eseguiMossa(args['source'] + args['target'], partitaGioca, scacchieraGioca);
    }
}

function mostraGioca(sezione) {
    document.getElementById("giocaComputer").style.display = "none";
    document.getElementById("giocaSolo").style.display = "none";
    document.getElementById("giocaRandom").style.display = "none";

    document.getElementById(sezione).style.display = "block";
    scacchieraCorrente = sezione === "giocaComputer" ? "scacchieraComputer" : sezione === "giocaSolo" ? "scacchieraSolo" : "scacchieraRandom";
    sezioneCorrente = sezione;
    aggiornaScacchieraGioca(scacchieraCorrente)
}

mostraGioca("giocaComputer");

document.getElementById("giocaComputerButton").addEventListener("click", function () {
    mostraGioca("giocaComputer");
});
document.getElementById("giocaSoloButton").addEventListener("click", function () {
    mostraGioca("giocaSolo");
});
document.getElementById("giocaRandomButton").addEventListener("click", function () {
    mostraGioca("giocaRandom");
});