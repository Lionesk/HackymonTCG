import {Card, CardType, EnergyCard, EnergyCat, PokemonCat} from '../api/collections';

export enum CardPosition {
    DECK = "deck",
    ACTIVE = "active",
    ATTATCHED = "attatched",
    BENCH = "bench",
    HAND = "hand",
    PRIZE = "prize",
    DISCARD = "discard",
    DRAG = "drag",
}

export class PlayableCard {
    id:number;
    card:Card;
    currentDamage:number;
    currentEnergy:Card[];
    currentPosition: CardPosition;
    previousPosition?: CardPosition; // used for drag and drop
    
    get position(): CardPosition {
        return this.currentPosition;
    }
    set position(pos: CardPosition) {
        this.previousPosition = this.currentPosition;
        this.currentPosition = pos;
    }

    damage(amount: number) {
        this.currentDamage += amount;
    }

    heal(amount: number) {
        this.currentDamage = Math.min(this.currentDamage - amount, 0);
    }
    
    constructor(id: number, card?:Card, playable?:PlayableCard){
        this.id = id;
        this.currentEnergy = new Array<Card>(0);
        this.currentPosition = CardPosition.DECK;
        if(card !== undefined && playable !== undefined) {
            this.currentDamage = 0;
        }
        else if(card !== undefined) {
            if(card.type == CardType.POKEMON){
                this.currentDamage = 0;
            }
            this.card = card;
        }
        else if(playable !== undefined) {
            if(playable.card.type === CardType.POKEMON){
                this.currentEnergy = playable.currentEnergy;
                this.currentDamage = playable.currentDamage;
                this.currentPosition = playable.currentPosition;
                this.previousPosition = playable.previousPosition;
                if(! this.currentDamage){
                    this.currentDamage=0;
                }
                if(! this.currentEnergy){
                    this.currentEnergy=new Array<Card>(0);
                }
            }
            else if(playable.card.type === CardType.ENERGY){
                this.card = playable.card;
            }
        }
    }
}