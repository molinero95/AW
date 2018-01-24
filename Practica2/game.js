const deck = require("./cards");


//Comienza el juego! repartimos las cartas
function startGame(gameId, players) {
    //Comenzar partida
    let newGameDeck = new deck();
    newGameDeck.shuffleDeck();
    let gameDeck = newGameDeck.getDeck();
    let p1 = [], p2 = [], p3 = [], p4 = [];
    for (let i = 0; i < 52; i++) {
        if (i % 4 === 0)
            p1.push(gameDeck.pop());
        else if (i % 4 === 1)
            p2.push(gameDeck.pop());
        else if (i % 4 === 2)
            p3.push(gameDeck.pop());
        else
            p4.push(gameDeck.pop());
    }
    
    /*
    Status.split(";"):
    status[0] cartas falsas en la mesa.
    status[1] cartas jugador 1
    status[2] cartas jugador 2
    status[3] cartas jugador 3
    status[4] cartas jugador 4
    status[5] turno actual
    status[6] jugador 1
    status[7] jugador 2
    status[8] jugador 3
    status[9] jugador 4
    status[10] cartas autenticas en la mesa

    */
    let order = shufflePlayers(players.players);
    let status = "NULL" + ";" + p1.toString() + ";" + p2.toString() + 
    ";" + p3.toString() + ";" + p4.toString() + ";" + order[0].name + ";" + order[0].name + ";" +
    order[1].name + ";"+ order[2].name + ";" + order[3].name + ";NULL";
    //El nombre de los jugadores lo guardaremos mas adelante
    return status;
}

function shufflePlayers(players){
    let index, temp;
    let order = players;
    for(let i = 0; i < players.length; i++){
        index = Math.floor(Math.random() * players.length);
        temp = order[index];
        order[index] = order[i];
        order[i] = temp;
    }
    return order;
}

function getTurnIndex(statusSplit, turn){
    let i = 6;
    while(i < 10 && statusSplit[i] !== turn)
        i++;
    return i;
}

function getNextTurn(statusSplit, turn){
    let i = 6;
    while(i < 10 && statusSplit[i] !== turn)
        i++;
    if(i === 9)
        return statusSplit[6];
    else
        return statusSplit[i + 1];
}

function getRandomCardByNumber(number){
    let carta = number;
    let rand = Math.floor(Math.random() * 4);
    switch(rand){
        case 0: carta += " de Corazones"; break;
        case 1: carta += " de Diamantes"; break;
        case 2: carta += " de Picas"; break;
        case 3: carta += " de Tréboles"; break;
    }
    return carta;
}

function playerStatus(player, status) {
    let split = status.split(";");
    let res = {
        table: split[0],
        turn: split[5],
        numCards: [],  //Contendra las cartas del usuario y el numero de cartas del resto
        names: [],
    };
    for (let i = 6; i < 10; i++) {
        let cards = split[i - 5].split(",");
        res.numCards.push(cards.length);
        res.names.push(split[i]);
        if (player === split[i])   //Si es el turno del jugador, mandamos sus cartas
            res.myCards = cards;
    }
    return res;

}

module.exports = {
    startGame: startGame,
    getNextTurn: getNextTurn,
    getTurnIndex: getTurnIndex,
    getRandomCardByNumber: getRandomCardByNumber,
    playerStatus: playerStatus,
}