<?php
// Avvia la sessione
session_start();

// Imposta l'intestazione Access-Control-Allow-Origin
header('Access-Control-Allow-Origin: *');

$problemi = array_map('str_getcsv', file('data\problemi\puzzles.csv'));
//shuffle($problemi);

// Ottieni l'indice del problema dalla richiesta GET, se esiste
$indice = isset($_GET['indice']) ? intval($_GET['indice']) : 0;

// Restituisci il problema corrente come JSON
header('Content-Type: application/json');
echo json_encode($problemi[$indice]);
?>
