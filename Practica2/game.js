
const deck = require("./cards");


//Comienza el juego! repartimos las cartas y establecemos el estado
function startGame(gameId, players) {
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
    let order = shufflePlayers(players.players);
    let status = {
        cards : [p1.sort(compare), p2.sort(compare), p3.sort(compare), p4.sort(compare)],
        names : [order[0].name, order[1].name, order[2].name, order[3].name],
        numCards : [p1.length, p2.length, p3.length, p4.length],
        trueOnTable : [],
        falseOnTable : [],
        lastCards : [],
        turn : order[0].name,
        end : {
            isEnded : false,
            winner : null,
        }
    }
    return JSON.stringify(status);
}

//Obtiene la posicion del jugador en el array para obtener sus cartas y su número de cartas
function getPlayerIndex(player, status){
    let index = 0;
    while(index < status.names.length && player !== status.names[index])
        index++;
    return index;
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


//Borra las cartas del mazo del jugador
function removeCardsSelected(myCards, cardsToRemove) {
    let newCards = [];
    let k = 0;
    for(let i = 0; i < myCards.length; i++){
        if(cardsToRemove[k] !== myCards[i])
            newCards.push(myCards[i]);
        else
            k++;
    }
    return newCards;
}

function addCards(cards, array){
    cards.forEach(c => {
        array.push(c);
    });
    array.sort(compare);
    return array;
}

//Obtiene el siguiente turno
function getNextTurn(index){
    if(index === 3)
        return 0;
    return index + 1;
}
//Obtiene el turno del jugador anterior
function getLastTurn(index){
    if(index === 0)
        return 3;
    return index - 1;
}

function checkIfLiar(lastCards, number){
    let liar = false;
    let index = 0;
    while(!liar && index < lastCards.length){
        if(lastCards[index].split(" ")[0] !== number)
            liar = true;
        index++;
    }
    return liar;
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

//Obtenemos los números descartados por el jugador
function getDiscardedNumbers(newCards, cards){
    let j = 0;
    let disc = [];
    console.log(newCards);
    console.log(cards);
    for(let i = 0; i < cards.length; i++){
        console.log("PAR: " + cards[i] + " " + newCards[j]);
        if(newCards[j] === cards[i])
            j++;
        else{
            console.log("ENTRO");
            if(disc.length === 0 || disc[disc.length - 1] !== cards[i].split(" ")[0])
                disc.push(cards[i].split(" ")[0]);
        }
    }
    return disc;
}

module.exports = {
    startGame: startGame,
    getRandomCardByNumber: getRandomCardByNumber,
    discard: discard,
    compare: compare,
    removeCardsSelected: removeCardsSelected,
    getPlayerIndex: getPlayerIndex,
    getNextTurn: getNextTurn,
    getLastTurn: getLastTurn,
    checkIfLiar: checkIfLiar,
    addCards: addCards,
    getDiscardedNumbers: getDiscardedNumbers,
}