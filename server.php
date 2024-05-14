<?php

// Imposta l'intestazione Access-Control-Allow-Origin
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$problemi = array_map('str_getcsv', file('data/problemi/puzzles.csv'));
shuffle($problemi);

// Credenziali di ognuno: mettere le proprie credenziali e modificare solo quale si vuole usare
$cred = array(
    "ale" => array(
        "host" => "localhost",
        "dbname" => "dbChessTactics",
        "dbuser" => "postgres",
        "dbpass" => "alepot55",
        "port" => 5432
    ),
    "filo" => array(
        "host" => "localhost",
        "dbname" => "dbChessTactics",
        "dbuser" => "postgres",
        "dbpass" => "filpostg",
        "port" => 5432
    ),
    "marco" => array(
        "host" => "localhost",
        "dbname" => "dbChessTactics",
        "dbuser" => "postgres",
        "dbpass" => "fabrizio1973",
        "port" => 5433
    )
);

// Scegliere le credenziali da usare
$credenziali = $cred["ale"];

//connessione col database
$dbconn = pg_connect("host={$credenziali['host']} dbname={$credenziali['dbname']} user={$credenziali['dbuser']} password={$credenziali['dbpass']} port={$credenziali['port']}") or die('Could not connect: ' . pg_last_error());

//------------------------------------------------------------------------------funzioni per gestione degli utenti

// Funzione per verificare che la password abbia almeno 8 caratteri e contenga almeno un numero
function passwordValida($password) {
    return true; // poi da togliere
    return strlen($password) >= 8 && preg_match('/[0-9]/', $password);
}

// Funzione per calcolare la password dato un username
function password($username) {
    global $dbconn;
    $query = "SELECT pswd FROM utenti WHERE username = '{$username}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $password = $ret["pswd"];
    if ($password === null) {
        return null;
    }

    return $password;
}

// Funzione per calcolare il punteggio dato un username
function punteggio($username) {
    global $dbconn;
    $query = "SELECT punteggio FROM utenti WHERE username = '{$username}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $punteggio = $ret["punteggio"];
    if ($punteggio === null) {
        return null;
    }

    return $punteggio;
}

// Funzione per effettuare il login
function login($dati) {

    $username = $dati['username'];
    $password = $dati['password'];
    $dati = array();

    $passwordTrovata = password($username);

    if ($passwordTrovata === null) {
        $dati['messaggio'] = "Utente non registrato";
    } else if ($passwordTrovata === $password) {
        $dati['messaggio'] = "Login riuscito";
        $dati['punteggio'] = punteggio($username);
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;
}

// funzione per registrare un nuovo utente
function registrazione($dati) {
    global $dbconn;
    $username = $dati['username'];
    $password = $dati['password'];
    $punteggio = 0;
    $img = 'def';   //alla registrazione un utente ha l'immagine di default
    $dati = array();

    $passwordTrovata = password($username);

    if (!passwordValida($password)) {
        $dati['messaggio'] = ("La password deve contenere almeno 8 caratteri e un numero");
    } else if ($passwordTrovata === null) {
        $query = "INSERT INTO utenti VALUES ('{$username}', '{$password}', '{$punteggio}', '{$img}')";
        $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

        $dati['messaggio'] = "Registrazione riuscita";
        $dati['punteggio'] = 0;
    } else {
        $dati['messaggio'] = "Username già esistente";
    }

    return $dati;
}

// funzione per effettuare il logout
function logout($dati) {
    $dati = array();

    $dati['messaggio'] = "Logout riuscito";

    return $dati;
}

// funzione per eliminare l'account
function elimina($dati) {
    global $dbconn;
    $username = $dati['username'];
    $password = $dati['password'];
    $dati = array();

    $passwordTrovata = password($username);

    if ($passwordTrovata === $password) {
        $query = "DELETE FROM utenti WHERE username = '{$username}'";
        $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

        $dati['messaggio'] = "Account eliminato";
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;
}

// funzione per modificare username e password
function modifica($dati) {
    global $dbconn;
    $username = $dati['username'];
    $nuovoUsername = $dati['nuovoUsername'];
    $nuovaPassword = $dati['nuovaPassword'];
    $dati = array();

    $passwordTrovata = password($nuovoUsername);

    // Modifica l'utente e la password
    if ($passwordTrovata !== null && $nuovoUsername !== $username) {
        $dati['messaggio'] = "Username già esistente";
    } else if (!passwordValida($nuovaPassword)) {
        $dati['messaggio'] = "La password deve contenere almeno 8 caratteri e un numero";
    } else {
        $query = "UPDATE utenti SET username = '{$nuovoUsername}', pswd = '{$nuovaPassword}' WHERE username = '{$username}'";
        $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

        $dati['messaggio'] = "Modifica effettuata";
    }

    return $dati;
}

// funzione per ritornare il path dell'immagine profilo dell'utente
function prendiImmagineProfilo($dati) {
    global $dbconn;
    $username = $dati['username'];
    $dati = array();

    $query = "SELECT * FROM utenti WHERE username = '{$username}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $immagine = $ret["img"];

    if ($immagine !== null) {
        $dati['messaggio'] = "Immagine profilo trovata";
        $dati['ret'] = $immagine;                               //immagine da restituire    
    } else {
        $dati['messaggio'] = "Profilo non trovato";
    }

    return $dati;
}

// imposta immagine profilo utente
function setImmagineProfilo($dati) {
    global $dbconn;
    $username = $dati['username'];
    $immagine = $dati['immagine'];
    $dati = array();

    $query = "UPDATE utenti SET img = '{$immagine}'  WHERE username = '{$username}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

    $dati['messaggio'] = "Immagine profilo caricata";
    $dati['ret'] = $immagine;

    return $dati;
}

// Funzione per aggiungere punti all'utente
function aggiungiPunti($dati) {
    global $dbconn;
    $username = $dati['username'];
    $punti = $dati['punti'];
    $dati = array();

    $query = "UPDATE utenti SET punteggio = punteggio + $punti WHERE username = '{$username}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

    $query = "SELECT punteggio FROM utenti WHERE username = '{$username}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $punteggio = $ret["punteggio"];

    $dati['messaggio'] = "Punti aggiunti";
    $dati['punteggio'] = $punteggio;

    return $dati;
}

//------------------------------------------------------------------------------funzioni per gestione delle partite

function creaPartita($dati) {
    global $dbconn;
    $username = $dati['username'];
    $protezione = $dati['protezione'];
    $dati = array();

    $query = "SELECT * FROM partite WHERE giocatore1 IS NOT NULL and incorso = true";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $codice = $ret["codice"];

    if ($codice !== null) {  //il risultato non è vuoto

        $query = "UPDATE partite SET giocatore2 = '{$username}' WHERE codice = '{$codice}'";
        $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

        $dati['codice'] = $codice;
        $dati['colore'] = 'b';
        $dati['iniziata'] = true;
        return $dati;
    }

    $query = "SELECT * FROM partite ORDER BY codice DESC";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $codice = $ret["codice"];
    if ($codice === null) {
        $codice = 0;
    } else {
        $codice = $codice + 1;
    }

    $query = "INSERT INTO partite VALUES ('{$codice}', '{$username}', NULL, NULL, '{$protezione}', true, NULL)";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

    $dati['codice'] = $codice;
    $dati['colore'] = 'w';
    $dati['iniziata'] = false;

    return $dati;
}

function aspettaGiocatori($dati) {
    global $dbconn;
    $codice = intval($dati['codice']);
    $dati = array();

    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $incorso = $ret["incorso"];
    $g2 = $ret["giocatore2"];
    if ($incorso === 'f') {
        $dati['annullata'] = true;
    } else if ($g2 !== null) {
        $dati['iniziata'] = true;
    } else {
        $dati['iniziata'] = false;
    }
    $dati['giocatore2'] = $g2;
    $dati['incorso'] = $incorso;

    return $dati;
}

function faiMossa($dati) {
    global $dbconn;
    $codice = intval($dati['codice']);
    $mossa = $dati['mossa'];
    $dati = array();

    $query = "UPDATE partite SET ultimaMossa = '{$mossa}' WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

    $query = "SELECT * FROM mosse ORDER BY numero_mossa DESC LIMIT 1";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $numero_mossa = $ret["numero_mossa"];

    $numero_mossa = $numero_mossa + 1;

    $query = "INSERT INTO mosse VALUES ('{$codice}', '{$mossa}', '{$numero_mossa}')";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

    return $dati;
}

function aspettaMossa($dati) {
    global $dbconn;
    $codice = intval($dati['codice']);
    $dati = array();

    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $mossa = $ret["ultimamossa"];

    $dati['mossa'] = $mossa;

    $incorso = $ret["incorso"];
    if ($incorso === 'f') {
        $dati['annullata'] = true;
    } else {
        $dati['annullata'] = false;
    }

    return $dati;
}

function annullaPartita($dati) {
    global $dbconn;
    $codice = intval($dati['codice']);
    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $g2 = $ret["giocatore2"];
    if ($g2 === null) {
        $dati = array();
        $query = "DELETE FROM partite WHERE codice = '{$codice}'";
        $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
        return $dati;
    } else {
        $dati['vittoria'] = 2;
        return finePartita($dati);
    }
}

function finePartita($dati) {
    global $dbconn;
    $codice = intval($dati['codice']);
    $vittoria = intval($dati['vittoria']);
    $username = $dati['username'];
    $dati = array();

    // Verifica se username è giocatore1 o giocatore2
    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $g2 = $ret["giocatore2"];
    if ($g2 === $username) {
        $vittoria = ($vittoria === 1) ? 2 : ($vittoria === 2 ? 1 : 0);
    }

    // incorso = false e vittoria = vittoria
    $query = "UPDATE partite SET incorso = false, vittoria = '{$vittoria}' WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());

    $dati['vittoria'] = $vittoria;
    $dati['codice'] = $codice;

    return $dati;
}

// -----------------------------------------------------------------------------funzioni per gestione dei problemi

function problema($dati) {
    $indice = $dati['indice'];
    global $problemi;
    $dati = array();

    $dati['problema'] = $problemi[$indice];

    return $dati;
}

// -----------------------------------------------------------------------------funzioni per gestione delle classifiche

function classifica($dati) {
    global $dbconn;
    $dati = array();

    $query = "SELECT * FROM utenti ORDER BY punteggio DESC";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $classifica = array();
    while ($row = pg_fetch_assoc($result)) {
        $classifica[] = $row;
    }

    $dati['classifica'] = $classifica;

    return $dati;
}

// funzioni che restituisce le partite giocate da un utente
function partiteGiocate($dati) {
    global $dbconn;
    $username = $dati['username'];
    $dati = array();

    $query = "SELECT * FROM partite WHERE giocatore1 = '{$username}' OR giocatore2 = '{$username}' ORDER BY codice DESC";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $partite = array();
    while ($row = pg_fetch_assoc($result)) {
        if ($username === $row['giocatore1']) {
            $avversario = $row['giocatore2'];
            $vittoria = intval($row['vittoria']);
        } else {
            $avversario = $row['giocatore1'];
            $vittoria = (intval($row['vittoria']) === 1) ? 2 : (intval($row['vittoria']) === 2 ? 1 : 0);
        }
        $row['avversario'] = $avversario;
        $row['punteggio_avversario'] = punteggio($avversario);
        $row['vittoria'] = $vittoria;
        $partite[] = $row;
    }

    $dati['partite'] = $partite;


    return $dati;
}

// funzione che data una partita restituisce le mosse fatte
function mossePartita($dati) {
    global $dbconn;
    $username = $dati['username'];
    $codice = $dati['codice'];
    $dati = array();

    // prendi le mosse della partita
    $query = "SELECT * FROM mosse WHERE codice = '{$codice}' ORDER BY numero_mossa";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $mosse = array();
    while ($row = pg_fetch_assoc($result)) {
        $mosse[] = $row;
    }

    // prendi l'orientamento della scacchiera per username
    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($dbconn, $query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $orientamento = ($username === $ret['giocatore1']) ? 'w' : 'b';

    $dati['orientamento'] = $orientamento;
    $dati['mosse'] = $mosse;

    return $dati;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $azione = $_POST['operazione'];
    $dati = $azione($_POST);
    echo json_encode($dati);
}
