create table utenti(
    username varchar(20) not null primary key,
    pswd varchar(20) not null,
    punteggio integer,
    img text
);

create table partite(
    codice integer primary key,
    giocatore1 varchar(20) references utenti(username),
    giocatore2 varchar(20) references utenti(username),
    ultimaMossa varchar(5),
    protezione varchar(30),
    constraint fk1 foreign key (giocatore1) references utenti(username) on update cascade,
    constraint fk2 foreign key (giocatore2) references utenti(username) on update cascade
)
