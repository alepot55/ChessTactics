// Seleziona gli elementi <div> tramite il loro id e aggiunge loro l'evento "click" che porta alla pagina gioca.html
const cardComputer = document.getElementById("computer");
const cardMultiplayer = document.getElementById("multiplayer");
const cardSolo = document.getElementById("solo");

// Aggiungi un gestore di eventi di click a ciascun div
cardComputer.addEventListener("click", function () {
  redirectToDropdown('giocaComputer');
});

cardMultiplayer.addEventListener("click", function () {
  redirectToDropdown('giocaMultiplayer');
});

cardSolo.addEventListener("click", function () {
  redirectToDropdown('giocaSolo');
});

function redirectToDropdown(value) {
  window.location.href = 'gioca.html?selected=' + encodeURIComponent(value);
}