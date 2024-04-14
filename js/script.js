// Variabili globali
const buttModNotte = document.getElementById("modalitaNotteButton");

buttModNotte.addEventListener("click", function () {
  modNotte = !modNotte;
  scacchieraGiocaComputer.cambiaTema(temaPezzi, temaScacchiera);
  scacchieraGiocaMultiplayer.cambiaTema(temaPezzi, temaScacchiera);
  scacchieraGiocaSolo.cambiaTema(temaPezzi, temaScacchiera);
  scacchieraProblemi.cambiaTema(temaPezzi, temaScacchiera);
});

// Gestione della navigazione
var navLinks = document.querySelectorAll('nav ul li a');
var sections = document.querySelectorAll('main section');

// Nascondi tutte le sezioni tranne Home all'inizio
window.onload = function () {
  sections.forEach(function (section) {
    if (section.getAttribute('id') !== 'home') {
      section.style.display = 'none';
    }
  });
};

navLinks.forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var target = this.getAttribute('href');

    sections.forEach(function (section) {
      section.style.display = 'none';
    });

    document.querySelector(target).style.display = 'block';
  });
});
