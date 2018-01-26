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
    status[11] ultimas cartas autenticas tiradas
    */
    let order = shufflePlayers(players.players);
    let status = "NULL" + ";" + p1.toString() + ";" + p2.toString() + 
    ";" + p3.toString() + ";" + p4.toString() + ";" + order[0].name + ";" + order[0].name + ";" +
    order[1].name + ";"+ order[2].name + ";" + order[3].name + ";NULL;NULL";
    //El nombre de los jugadores lo guardaremos mas adelante
    return status;
}

//Orden aleatorio de los jugadores
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

//Obtiene el indice del jugador al que corresponde el turno para poder obtener sus cartas
function getTurnIndex(statusSplit, turn){
    let i = 6;
    while(i < 10 && statusSplit[i] !== turn)
        i++;
    return i;
}

//Obtiene el índice del jugador anterior al turno actual
function getLastTurn(statusSplit, turn) {
    let i = 6;
    let anterior = 0;
    while(i < 10 && statusSplit[i] !== turn){
        i++;
    }
    anterior = i - 1;
    if(anterior === 5)
        anterior = 9;
    return anterior;
}

//Obtiene el indice del siguiente turno al actual.
function getNextTurn(statusSplit, turn){
    let i = 6;
    while(i < 10 && statusSplit[i] !== turn)
        i++;
    if(i === 9)
        return 6;
    else
        return i + 1;
}

//Obtiene una carta aleatoria para mostrar en la mesa con el mismo numero al que se está jugando
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

//Obtiene el estado de la partida necesario para el jugador
function playerStatus(player, status) {
    let split = status.split(";");
    let res = {
        table: split[0],    //Las supuestas cartas sobre la mesa
        turn: split[5],
        numCards: [],  //Contendra las cartas del usuario y el numero de cartas del resto
        names: [],
    };
    for (let i = 6; i < 10; i++) {
        if(split[i - 5] === "NULL"){
            res.numCards.push(0);   //Colocamos un 0
            res.names.push(split[i]);
            if(player === split[i])
                res.myCards = "NULL";
        }
        else{
            let cards = split[i - 5].split(",");
            res.numCards.push(cards.length);
            res.names.push(split[i]);
            if (player === split[i])   //Si es el turno del jugador, mandamos sus cartas
                res.myCards = cards;
        }
    }
    if(res.myCards !== "NULL")  //Si el jugador se ha quedado sin cartas
        res.myCards = res.myCards.sort(compare);
    return res;

}

function compare(card1, card2){
    let sp1 = card1.split(" ")[0];
    let sp2 = card2.split(" ")[0];
    if(sp1 === sp2)
        return 0;
    if(isNaN(sp1) && isNaN(sp2)){
        if(sp1 === "AS") //sp2 > sp1
            return -1;
        else if(sp2 === "AS") //sp1 > sp2
            return 1;
        else if(sp1 === "K")  //sp1 > sp2
            return 1;
        else if(sp2 === "K")  //sp2 > sp1
            return -1;
        else if(sp1 > sp2)  //sp1 > sp2
            return 1;
        return -1;      //sp2 > sp1
    }
    else if(isNaN(sp1)){ //SP1 = AS, J, Q, K
        if(sp1 === "AS")    //sp2 > sp1
            return -1;
        return 1;   //sp1 > sp2
    }
    else if(isNaN(sp2)){ //SP2 = AS, J, Q, K
        if(sp2 === "AS")    //sp1 > sp2
            return 1;
        return -1;  //sp2 > sp1
    }
    else{//Ambos son numeros
        sp1 = Number(sp1);
        sp2 = Number(sp2);
        if(sp1 > sp2)
            return 1;
        return -1;
    }
}


function discard(cards){
    let disc = false;
    let before = "";
    let count = 0;
    let newCards = [];
    for(let i = 0; i < cards.length; i++) {
        newCards.push(cards[i]);
        if(before === "")
            before = cards[i];
        if(cards[i].split(" ")[0] === before){
            count++;
            if(count === 4){
                disc = true;
                for(let k = 0; k < 4; k++)
                    newCards.pop();
            }
        }
        else{
            before = cards[i].split(" ")[0];
            count = 1;
        }
    }
    return newCards;
}

function removeCardsSelected(myCards, cardsToRemove) {
    let newCards = [];
    let k = 0;
    for(let i = 0; i < myCards.length; i++){
        if(cardsToRemove[k] !== myCards[i])
            newCards.push(myCards[i]);
        else
            k++;
    }
    if(newCards.length === 0)
        newCards = "NULL";
    console.log(newCards); 
    return newCards;
}

module.exports = {
    startGame: startGame,
    getNextTurn: getNextTurn,
    getLastTurn: getLastTurn,
    getTurnIndex: getTurnIndex,
    getRandomCardByNumber: getRandomCardByNumber,
    playerStatus: playerStatus,
    discard: discard,
    compare: compare,
    removeCardsSelected: removeCardsSelected,
}