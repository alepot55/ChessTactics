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

// Funzione per verificare che la password abbia almeno 8 caratteri e contenga almeno un numero
function passwordValida($password)
{
    return true; // poi da togliere
    return strlen($password) >= 8 && preg_match('/[0-9]/', $password);
}

// Funzione per sommare un punteggio a un utente
function sommaPunteggio($utenti, $username, $punteggio)
{
    foreach ($utenti as $key => $utente) {
        if ($utente['username'] === $username) {
            $utenti[$key]['punteggio'] += $punteggio;
            $punteggio = $utenti[$key]['punteggio'];
        }
    }

    // Salva l'array di utenti nel file
    file_put_contents('data\utenti.json', json_encode($utenti));

    return $punteggio;
}

// Funzione per calcolare la password dato un username
function password($utenti, $username)
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
    $dati = array();

    if ($azione === 'login') {
        // Gestisci il login
        $username = $_POST['username'];
        $password = $_POST['password'];

        // calcola la password per l'utente
        $passwordTrovata = password($utenti, $username);

        if ($passwordTrovata === null) {
            $dati['messaggio'] = "Utente non registrato";
        } else if ($passwordTrovata === $password) {
            //$_SESSION['username'] = $username;
            $dati['messaggio'] = "Login riuscito";
            $dati['punteggio'] = sommaPunteggio($utenti, $username, $_POST['punteggio']);
        } else {
            $dati['messaggio'] = "Password errata";
        }
    } else if ($azione === 'registrazione') {
        // Gestisci la registrazione
        $username = $_POST['username'];
        $password = $_POST['password'];

        $passwordTrovata = password($utenti, $username);

        if (!passwordValida($password)) {
            $dati['messaggio'] = ("La password deve contenere almeno 8 caratteri e un numero");
        } else if ($passwordTrovata === null) {
            $nuovoUtente = array(
                'username' => $username, 
                'password' => $password,
                'punteggio' => $_POST['punteggio']
            );
            array_push($utenti, $nuovoUtente);
            $dati['messaggio'] = "Registrazione riuscita";
            $dati['punteggio'] = $_POST['punteggio'];

            // Salva l'array di utenti nel file
            file_put_contents('data\utenti.json', json_encode($utenti));
        } else {
            $dati['messaggio'] = "Username già esistente";
        }
    } else if ($azione === 'logout') {
        // Gestisci il logout
        //session_unset();
        //session_destroy();
        $dati['messaggio'] = "Logout riuscito";
    } else if ($azione === 'elimina') {
        // Gestisci l'eliminazione dell'account
        $username = $_POST['username'];
        $password = $_POST['password'];

        $passwordTrovata = password($utenti, $username);

        if ($passwordTrovata === $password) {
            // Rimuovi l'utente dall'array
            foreach ($utenti as $key => $utente) {
                if ($utente['username'] === $username) {
                    unset($utenti[$key]);
                }
            }

            // Salva l'array di utenti nel file
            file_put_contents('data\utenti.json', json_encode($utenti));

            // Esegui il logout
            //session_unset();
            //session_destroy();
            $dati['messaggio'] = "Account eliminato";
        } else {
            $dati['messaggio'] = "Password errata";
        }
    
    } else if ($azione === 'modifica') {

        // Gestisci la modifica della password
        $username = $_POST['username'];
        $nuovoUsername = $_POST['nuovoUsername'];
        $nuovaPassword = $_POST['nuovaPassword'];

        $passwordTrovata = password($utenti, $nuovoUsername);

        // Modifica l'utente e la password
        if ($passwordTrovata !== null && $nuovoUsername !== $username) {
            $dati['messaggio'] = "Username già esistente";
        } else if (!passwordValida($nuovaPassword)) {
            $dati['messaggio'] = "La password deve contenere almeno 8 caratteri e un numero";
        } else {
            foreach ($utenti as $key => $utente) {
                if ($utente['username'] === $username) {
                    $utenti[$key]['username'] = $nuovoUsername;
                    $utenti[$key]['password'] = $nuovaPassword;
                }
            }

            // Salva l'array di utenti nel file
            file_put_contents('data\utenti.json', json_encode($utenti));
            $dati['messaggio'] = "Modifica effettuata";
        }
    }
    echo json_encode($dati);
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Ottieni l'indice del problema dalla richiesta GET, se esiste
    $indice = isset($_GET['indice']) ? intval($_GET['indice']) : 0;

    // Restituisci il problema corrente come JSON
    echo json_encode($problemi[$indice]);
}

