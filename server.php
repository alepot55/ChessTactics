<?php

// Imposta l'intestazione Access-Control-Allow-Origin
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$problemi = array_map('str_getcsv', file('data/problemi/puzzles.csv'));
//shuffle($problemi);

$host = "localhost";
$dbname = "dbChessTactics";
$dbuser = "postgres";
$dbpass = "filpostg";
$porta = 5432;

//connessione col database
$dbconn = pg_connect("host=localhost port=5432 dbname=dbChessTactics user=postgres password=filpostg") or die("Could not connect: " . pg_last_error());


// Carica l'array di utenti dal file
$utenti = json_decode(file_get_contents('data/utenti.json'), true);
$partite = json_decode(file_get_contents('data/partite.json'), true);


//------------------------------------------------------------------------------funzioni per gestione degli utenti


// Funzione per verificare che la password abbia almeno 8 caratteri e contenga almeno un numero
function passwordValida($password) {
    return true; // poi da togliere
    return strlen($password) >= 8 && preg_match('/[0-9]/', $password);
}



// Funzione per sommare un punteggio a un utente
function sommaPunteggio($utenti, $username, $punteggio) {
    $query = "UPDATE utenti SET punteggio = punteggio + $punteggio WHERE username = '{$username}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());

    //restituisco il nuovo punteggio
    $query = "SELECT punteggio FROM utenti WHERE username = '{$username}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);

    return $ret["punteggio"];


    /*
    foreach ($utenti as $key => $utente) {
        if ($utente['username'] === $username) {
            $utenti[$key]['punteggio'] += $punteggio;
            $punteggio = $utenti[$key]['punteggio'];
        }
    }

    // Salva l'array di utenti nel file
    file_put_contents('data\utenti.json', json_encode($utenti));

    return $punteggio;
    */

}



// Funzione per calcolare la password dato un username
function password($utenti, $username) {
    $query = "SELECT pswd FROM utenti WHERE username = '{$username}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $password = $ret["pswd"];
    if ($password === null){
        return null;
    }

    return $password;


    /*
    foreach ($utenti as $utente) {
        if ($utente['username'] === $username) {
            return $utente['password'];
        }
    }
    return null;
    */
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
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;
    
}



function registrazione($dati) {
    $username = $dati['username'];
    $password = $dati['password'];
    $punteggio = $_POST['punteggio'];
    $img = 'def';   //alla registrazione un utente ha l'immagine di default
    global $utenti;
    $dati = array();

    $passwordTrovata = password($utenti, $username);

    if (!passwordValida($password)) {
        $dati['messaggio'] = ("La password deve contenere almeno 8 caratteri e un numero");
    } else if ($passwordTrovata === null) {
        $query = "INSERT INTO utenti VALUES ('{$username}', '{$password}', '{$punteggio}', '{$img}')";
        $result = pg_query($query) or die("Query failed: " . pg_last_error());

        $dati['messaggio'] = "Registrazione riuscita";
        $dati['punteggio'] = $_POST['punteggio'];
    } else {
        $dati['messaggio'] = "Username già esistente";
    }

    return $dati;



    /*
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
    } else {
        $dati['messaggio'] = "Username già esistente";
    }

    return $dati;
    */
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
        $query = "DELETE FROM utenti WHERE username = '{$username}'";
        $result = pg_query($query) or die("Query failed: " . pg_last_error());

        $dati['messaggio'] = "Account eliminato";
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;


    /*
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

        $dati['messaggio'] = "Account eliminato";
    } else {
        $dati['messaggio'] = "Password errata";
    }

    return $dati;
    */
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
        $query = "UPDATE utenti SET username = '{$nuovoUsername}', pswd = '{$nuovaPassword}' WHERE username = '{$username}'";
        $result = pg_query($query) or die("Query failed: " . pg_last_error());

        $dati['messaggio'] = "Modifica effettuata";
    }

    return $dati;


    /*
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
        $dati['messaggio'] = "Modifica effettuata";
    }

    return $dati;
    */
}



// funzione per ritornare il path dell'immagine profilo dell'utente
function prendiImmagineProfilo($dati) {
    $username = $dati['username'];
    $dati = array();

    $query = "SELECT * FROM utenti WHERE username = '{$username}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $immagine = $ret["img"];

    if ($immagine !== null){
        $dati['messaggio'] = "Immagine profilo trovata";
        $dati['ret'] = $immagine;                               //immagine da restituire    
    }
    else{
        $dati['messaggio'] = "Profilo non trovato";
    }

    return $dati;

}

// imposta immagine profilo utente
function setImmagineProfilo($dati){
    $username = $dati['username'];
    $immagine = $dati['immagine'];
    $dati = array();

    $query = "UPDATE utenti SET img = '{$immagine}'  WHERE username = '{$username}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    
    $dati['messaggio'] = "Immagine profilo caricata";
    $dati['ret'] = $immagine;
    
    return $dati;
}



//------------------------------------------------------------------------------funzioni per gestione delle partite


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

    $query = "SELECT * FROM partite WHERE giocatore1 is not null and giocatore2 is null and protezione = '{$protezione}' LIMIT 1";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $cod = $ret["codice"];
    if ($cod !== null){  //il risultato non è vuoto
        $codice = $cod;
        
        $query = "UPDATE partite SET giocatore2 = '{$username}' WHERE (codice, giocatore1, giocatore2, ultimaMossa, protezione) is in (SELECT * FROM partite WHERE giocatore1 is not null and giocatore2 is null and protezione = '{$protezione}' LIMIT 1)";
        $result = pg_query($query) or die("Query failed: " . pg_last_error());

        $dati['codice'] = $codice;
        $dati['colore'] = 'b';
        $dati['iniziata'] = true;
        return $dati;
    }



    $query = "SELECT * FROM partite ORDER BY codice DESC";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $c = $ret["codice"];
    if ($c === null){
        $codice = 0;
    }
    else{
        $codice = $c + 1;
    }

    $query = "INSERT INTO partite VALUES ('{$codice}', '{$username}', NULL, NULL, '{$protezione}')";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());

    $dati['codice'] = $codice;
    $dati['colore'] = 'w';
    $dati['iniziata'] = false;

    return $dati;


    /*
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
    */
}



function aspettaGiocatori($dati) {
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $g1 = $ret["giocatore1"];
    $g2 = $ret["giocatore2"];
    if ($g1 === null){
        $dati['annullata'] = true;
    }
    else if ($g2 !== null){
        $dati['iniziata'] = true;
    }
    else{
        $dati['iniziata'] = false;
    }
    $dati['giocatore2'] = $g2;

    return $dati;


    /*
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
    */
}



function faiMossa($dati) {
    global $partite;
    $codice = intval($dati['codice']);
    $mossa = $dati['mossa'];
    $dati = array();

    $query = "UPDATE partite SET ultimaMossa = '{$mossa}' WHERE codice = '{$codice}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());

    return $dati;

    
    /*
    global $partite;
    $codice = intval($dati['codice']);
    $mossa = $dati['mossa'];
    $dati = array();

    $partite[$codice]['ultimaMossa'] = $mossa;

    return $dati;
    */
}

function aspettaMossa($dati) {
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    $query = "SELECT * FROM partite WHERE codice = '{$codice}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());
    $ret = pg_fetch_assoc($result);
    $mossa = $ret["ultimaMossa"];

    $dati['mossa'] = $mossa;

    $g1 = $ret["giocatore1"];
    $g2 = $ret["giocatore2"];

    if ($g1 === null && $g2 === null){
        $dati['annullata'] = true;
    }
    else{
        $dati['annullata'] = false;
    }

    return $dati;


    /*
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    $mossa = $partite[$codice]['ultimaMossa'];
    $dati['mossa'] = $mossa;

    if ($partite[$codice]['giocatore1'] === null && $partite[$codice]['giocatore2'] === null) {
        $dati['annullata'] = true;
    } else {
        $dati['annullata'] = false;
    }

    return $dati;
    */
}

function annullaPartita($dati) {
    return finePartita($dati);
}

function finePartita($dati) {
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    $query = "UPDATE partite SET giocatore1 = NULL, giocatore2 = NULL ultimaMossa = NULL, protezione = NULL WHERE codice = '{$codice}'";
    $result = pg_query($query) or die("Query failed: " . pg_last_error());

    return $dati;
    
    
    /*
    global $partite;
    $codice = intval($dati['codice']);
    $dati = array();

    $partite[$codice]['giocatore1'] = null;
    $partite[$codice]['giocatore2'] = null;
    $partite[$codice]['ultimaMossa'] = null;
    $partite[$codice]['protezione'] = null;

    return $dati;
    */
}



if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $azione = $_POST['operazione'];
    $dati = $azione($_POST);

    //file_put_contents('data/utenti.json', json_encode($utenti));
    //file_put_contents('data/partite.json', json_encode($partite));
    echo json_encode($dati);
}