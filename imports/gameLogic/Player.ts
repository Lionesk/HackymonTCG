import {PlayableCard} from './PlayableCard';

export class Player{

    active:PlayableCard;    
    hand:PlayableCard[];
    bench:PlayableCard[];
    prize:PlayableCard[];
    deck:PlayableCard[];

    constructor(player?:Player){
       this.hand = new Array<PlayableCard>();
       this.deck = null;
       this.bench = new Array<PlayableCard>();
       this.prize = new Array<PlayableCard>();
    }

}