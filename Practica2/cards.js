cards = [
    "AS de Corazones",
    "As de Diamantes",
    "AS de Picas",
    "AS de Tréboles",
    "2 de Corazones",
    "2 de Diamantes",
    "2 de Picas",
    "2 de Tréboles",
    "3 de Corazones",
    "3 de Diamantes",
    "3 de Picas",
    "3 de Tréboles",
    "4 de Corazones",
    "4 de Diamantes",
    "4 de Picas",
    "4 de Tréboles",
    "5 de Corazones",
    "5 de Diamantes",
    "5 de Picas",
    "5 de Tréboles",
    "6 de Corazones",
    "6 de Diamantes",
    "6 de Picas",
    "6 de Tréboles",
    "7 de Corazones",
    "7 de Diamantes",
    "7 de Picas",
    "7 de Tréboles",
    "8 de Corazones",
    "8 de Diamantes",
    "8 de Picas",
    "8 de Tréboles",
    "9 de Corazones",
    "9 de Diamantes",
    "9 de Picas",
    "9 de Tréboles",
    "10 de Corazones",
    "10 de Diamantes",
    "10 de Picas",
    "10 de Tréboles",
    "J de Corazones",
    "J de Diamantes",
    "J de Picas",
    "J de Tréboles",
    "Q de Corazones",
    "Q de Diamantes",
    "Q de Picas",
    "Q de Tréboles",
    "K de Corazones",
    "K de Diamantes",
    "K de Picas",
    "K de Tréboles",
]

class DeckOfCards {
    constructor(){
        this.deck = cards.slice();
    }

    getDeck(){
        return this.deck;
    }

    shuffleDeck(){
        let tam = this.deck.length, temp, index;
        while (tam > 0) {
            index = Math.floor(Math.random() * tam);
            tam--;
            temp = this.deck[tam];
            this.deck[tam] = this.deck[index];
            this.deck[index] = temp;
        }
    }
}

module.exports = DeckOfCards;