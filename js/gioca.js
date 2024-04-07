// le sezioni sono giocaComputer, giocaSolo, giocaRandom
// le scacchiere sono scacchieraComputer, scacchieraSolo, scacchieraRandom

var sezioneCorrente = "giocaComputer";
var scacchieraCorrente = "scacchieraComputer";
DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function iniziaScacchieraGioca(scacchiera) {
    gameGioca = new Chess(DEFAULT_POSITION);
    boardGioca = Chessboard2(scacchiera, {
        position: gameGioca.fen(),
        draggable: true,
        trashSpeed: 'slow',
        orientation: gameGioca.turn() === 'w' ? 'white' : 'black',
        // onDragStart: bloccaMosse,
        // onDrop: onDropSolo,
        // onMouseenterSquare: mostraOmbreGioca,
        // onMousedownSquare: clicca,
    });
}    

function mostraGioca(sezione) {
    document.getElementById("giocaComputer").style.display = "none";
    document.getElementById("giocaSolo").style.display = "none";
    document.getElementById("giocaRandom").style.display = "none";

    document.getElementById(sezione).style.display = "block";
    scacchieraCorrente = sezione === "giocaComputer" ? "scacchieraComputer" : sezione === "giocaSolo" ? "scacchieraSolo" : "scacchieraRandom";
    sezioneCorrente = sezione;
    iniziaScacchieraGioca(scacchieraCorrente)
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