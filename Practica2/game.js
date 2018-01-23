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




function playGame(status, playerName){
    let split = status.split(";");
    if(checkIfStarted(split)){  //Si ya estan establecidos los nombres de los jugadores...
        if(getTurn() === playerName) { //puede mover

        }
        else{   //No puede mover

        }
    }
}

function checkIfStarted(split){
    if(split[6] === "NULL")
        return false;
    return true;
}

module.exports = {
    startGame: startGame
}