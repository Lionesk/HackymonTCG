import {PlayableCard} from './PlayableCard';
import {GameManager} from "./GameManager";

export class Player{

    id: string;
    active?: PlayableCard;    
    hand: PlayableCard[];
    bench: PlayableCard[];
    prize: PlayableCard[];
    deck: PlayableCard[];
    discard: PlayableCard[];
    inPlay: PlayableCard[];
    deckIndex: number;

    constructor(player?: Player){
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.deck = [];
        this.hand = [];
        this.bench = [];
        this.prize = [];
        this.discard = [];
        this.inPlay = [];
        this.deckIndex = 0;
    }

    draw(amount: number = 1) {
        if (this.deck.length < amount) {
            return GameManager.setLoser(this);
        }
        this.hand = this.hand.concat(this.deck.slice(0, amount));
        this.deck = this.deck.slice(amount);
    }

}