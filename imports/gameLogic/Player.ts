import {PlayableCard} from './PlayableCard';

export class Player{

    active:PlayableCard;    
    hand:PlayableCard[];
    bench:PlayableCard[];
    prize:PlayableCard[];
    deck:PlayableCard[];
    discard:PlayableCard[];

    constructor(player?:Player){
        this.deck = null;
        this.hand = [];
        this.bench = [];
        this.prize = [];
        this.discard = [];
    }

}