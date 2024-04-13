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
$partite = json_decode(file_get_contents('data\partite.json'), true);

// Funzione per verificare che la password abbia almeno 8 caratteri e contenga almeno un numero
function passwordValida($password) {
    return true; // poi da togliere
    return strlen($password) >= 8 && preg_match('/[0-9]/', $password);
}

// Funzione per sommare un punteggio a un utente
function sommaPunteggio($utenti, $username, $punteggio) {
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
function password($utenti, $username) {
    foreach ($utenti as $utente) {
        if ($utente['username'] === $username) {
            return $utente['password'];
        }
    }
    return null;
}

function sessione($dati) {
    $dati = array();

    if (isset($_SESSION['username'])) {
        $dati['username'] = $_SESSION['username'];
        $dati['punteggio'] = $_SESSION['punteggio'];
    } else {
        $dati['username'] = null;
        $dati['punteggio'] = 0;
    }

    return $dati;
}

function login($dati) {
    $username = $dati['username'];
    $password = $dati['password'];
    global $utenti;
    $dati = array();

    $passwordTrovata = password($utenti, $username);

    if ($passwordTrovata === null) {
        $dati['messaggio'] = "Utente non registrato";
    } else if ($passwordTrovata === $password) {
        $dati['messaggio'] = "Login riuscito";
        $dati['punteggio'] = sommaPunteggio($utenti, $username, $_POST['punteggio']);
        $_SESSION['username'] = $username;
        $_SESSION['punteggio'] = $dati['punteggio'];
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;
}

function registrazione($dati) {
    $username = $dati['username'];
    $password = $dati['password'];
    global $utenti;
    $dati = array();

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
        $_SESSION['username'] = $username;
        $_SESSION['punteggio'] = $dati['punteggio'];
    } else {
        $dati['messaggio'] = "Username già esistente";
    }

    return $dati;
}

function logout($dati) {
    $dati = array();

    $dati['messaggio'] = "Logout riuscito";

    return $dati;
}

function elimina($dati) {
    $username = $dati['username'];
    $password = $dati['password'];
    global $utenti;
    $dati = array();

    $passwordTrovata = password($utenti, $username);

    if ($passwordTrovata === $password) {
        // Rimuovi l'utente dall'array
        foreach ($utenti as $key => $utente) {
            if ($utente['username'] === $username) {
                unset($utenti[$key]);
            }
        }

        // Esegui il logout
        //session_unset();
        //session_destroy();
        $dati['messaggio'] = "Account eliminato";
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;
}

function modifica($dati) {
    $username = $dati['username'];
    $nuovoUsername = $dati['nuovoUsername'];
    $nuovaPassword = $dati['nuovaPassword'];
    global $utenti;
    $dati = array();

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
        $dati['messaggio'] = "Modifica effettuata";
    }

    return $dati;
}

function problema($dati) {
    $indice = $dati['indice'];
    global $problemi;
    $dati = array();

    $dati['problema'] = $problemi[$indice];

    return $dati;
}

function creaPartita($dati) {
    $username = $dati['username'];
    $protezione = $dati['protezione'];
    global $partite;
    $dati = array();

    foreach ($partite as $partita) {
        if ($partita['giocatore1'] !== null && $partita['giocatore2'] === null && $partita['protezione'] === $protezione) {
            $codice = intval($partita['codice']);
            $partite[$codice]['giocatore2'] = $username;
            $dati['codice'] = $codice;
            $dati['colore'] = 'b';
            $dati['iniziata'] = true;
            return $dati;
        }
    }


    $codice = count($partite);
    $nuovaPartita = array(
        'codice' => $codice,
        'giocatore1' => $username,
        'giocatore2' => null,
        'ultimaMossa' => null,
        'protezione' => $protezione
    );
    array_push($partite, $nuovaPartita);
    $dati['codice'] = $codice;
    $dati['colore'] = 'w';
    $dati['iniziata'] = false;

    return $dati;
}

function aspettaGiocatori($dati) {
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    if ($partite[$codice]['giocatore1'] === null) {
        $dati['annullata'] = true;
    } else if ($partite[$codice]['giocatore2'] !== null) {
        $dati['iniziata'] = true;
    } else {
        $dati['iniziata'] = false;
    }
    $dati['giocatore2'] = $partite[$codice]['giocatore2'];

    return $dati;
}

function faiMossa($dati) {
    global $partite;
    $codice = $dati['codice'];
    $mossa = $dati['mossa'];
    $dati = array();

    $partite[$codice]['ultimaMossa'] = $mossa;

    return $dati;
}

function aspettaMossa($dati) {
    global $partite;
    $codice = $dati['codice'];
    $dati = array();

    $mossa = $partite[$codice]['ultimaMossa'];
    $dati['mossa'] = $mossa;

    if ($partite[$codice]['giocatore1'] === null && $partite[$codice]['giocatore2'] === null) {
        $dati['annullata'] = true;
    } else {
        $dati['annullata'] = false;
    }

    return $dati;
}

function annullaPartita($dati) {
    return finePartita($dati);
}

function finePartita($dati) {
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    $partite[$codice]['giocatore1'] = null;
    $partite[$codice]['giocatore2'] = null;
    $partite[$codice]['ultimaMossa'] = null;
    $partite[$codice]['protezione'] = null;

    return $dati;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $azione = $_POST['operazione'];
    $dati = $azione($_POST);

    file_put_contents('data\utenti.json', json_encode($utenti));
    file_put_contents('data\partite.json', json_encode($partite));
    echo json_encode($dati);
}
