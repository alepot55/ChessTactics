<?php
// Avvia la sessione
session_start();

// Imposta l'intestazione Access-Control-Allow-Origin
header('Access-Control-Allow-Origin: *');

$csv = array_map('str_getcsv', file('data\problemi\puzzles.csv'));

// Ottieni l'indice del problema dalla richiesta GET, se esiste
$problema_index = isset($_GET['problema_index']) ? intval($_GET['problema_index']) : 0;

// Restituisci il problema corrente come JSON
header('Content-Type: application/json');
echo json_encode($csv[$problema_index]);
?>
