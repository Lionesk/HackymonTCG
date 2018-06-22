import {PlayableCard} from './PlayableCard';

export class Player{

    active:PlayableCard;    
    hand:PlayableCard[];
    bench:PlayableCard[];
    prize:PlayableCard[];
    deck:PlayableCard[];

    constructor(player?:Player){
       this.hand = new Array<PlayableCard>(0);
       //TODO: Need to inject the card list into this deck object with getDeck function
       this.deck = null;
       this.bench = new Array<PlayableCard>(5);
       this.prize = new Array<PlayableCard>(6);
    }

}