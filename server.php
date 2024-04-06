<?php
// Avvia la sessione
session_start();

// Imposta l'intestazione Access-Control-Allow-Origin
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$problemi = array_map('str_getcsv', file('data\problemi\puzzles.csv'));
//shuffle($problemi);

// Carica l'array di utenti dal file
$utenti = json_decode(file_get_contents('data\utenti.json'), true);

// Funzione per calcolare la password dato un username
function calcolaPassword($utenti, $username)
{
    foreach ($utenti as $utente) {
        if ($utente['username'] === $username) {
            return $utente['password'];
        }
    }
    return null;
}

// Controlla il tipo di richiesta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ottieni il tipo di azione (login o registrazione)
    $azione = $_POST['operazione'];

    if ($azione === 'login') {
        // Gestisci il login
        $username = $_POST['username'];
        $password = $_POST['password'];

        // calcola la password per l'utente
        $passwordCalcolata = calcolaPassword($utenti, $username);

        if ($passwordCalcolata === $password) {
            // Per ora, supponiamo che il login sia riuscito
            $_SESSION['username'] = $username;
            echo json_encode("Login riuscito");
        } else {
            echo json_encode("Password errata");
        }
    } else if ($azione === 'registrazione') {
        // Gestisci la registrazione
        $username = $_POST['username'];
        $password = $_POST['password'];

        $passwordCalcolata = calcolaPassword($utenti, $username);

        if ($passwordCalcolata === null) {
            $nuovoUtente = array('username' => $username, 'password' => $password);
            array_push($utenti, $nuovoUtente);
            $_SESSION['username'] = $username;
            echo json_encode("Registrazione riuscita");

            // Salva l'array di utenti nel file
            file_put_contents('data\utenti.json', json_encode($utenti));
        } else {
            echo json_encode("Username già esistente");
        }
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Ottieni l'indice del problema dalla richiesta GET, se esiste
    $indice = isset($_GET['indice']) ? intval($_GET['indice']) : 0;

    // Restituisci il problema corrente come JSON
    echo json_encode($problemi[$indice]);
}
