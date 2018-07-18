import {PlayableCard} from './PlayableCard';

export class Player{

    active?: PlayableCard;    
    hand: PlayableCard[];
    bench: PlayableCard[];
    prize: PlayableCard[];
    deck: PlayableCard[];
    discard: PlayableCard[];
    
    inPlay: PlayableCard[];
    deckIndex: number;

    constructor(player?: Player){
        this.deck = [];
        this.hand = [];
        this.bench = [];
        this.prize = [];
        this.discard = [];
        this.inPlay = [];
        this.deckIndex = 0;
    }

}