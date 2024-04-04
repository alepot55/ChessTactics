<?php
// Avvia la sessione
session_start();

// Imposta l'intestazione Access-Control-Allow-Origin
header('Access-Control-Allow-Origin: *');

// Leggi i problemi da un file di testo
$problemi = file('data/problemi/matto_in_2.txt');

// Crea un array per memorizzare i problemi
$listaProblemi = array();
$count = 0;
$num_problema = 0;

// Elabora ogni problema
foreach ($problemi as $problema) {

    if ($count != 3 && $count != 4) {

        if ($count == 0) {
            $listaProblemi[$num_problema] = array();
        }

        $line = trim($problema);

        // aggiungi la riga all'array num_problema
        $listaProblemi[$num_problema][$count] = $line;
    }

    // Incrementa il contatore
    $count++;
    if ($count == 5) {
        $count = 0;
        $num_problema++;
    }
}

// Ottieni l'indice del problema dalla richiesta GET, se esiste
$problema_index = isset($_GET['problema_index']) ? intval($_GET['problema_index']) : 0;

// Restituisci il problema corrente come JSON
header('Content-Type: application/json');
echo json_encode($listaProblemi[$problema_index]);
?>
