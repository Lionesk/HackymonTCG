import {Card, CardType, EnergyCard, EnergyCat, PokemonCat} from '../api/collections';


export class PlayableCard{
    id:number;
    card:Card;
    currentDamage:number;
    currentEnergy:Card[];
    
    constructor(id: number, card?:Card, playable?:PlayableCard){
        this.id = id;
        this.currentEnergy = new Array<Card>(0);
        if(card !== undefined && playable !== undefined) {
            this.currentDamage = null;
        }
        else if(card !== undefined) {
            if(card.type == CardType.POKEMON){
                this.currentDamage = 0;
            }
            this.card = card;
        }
        else if(playable !== undefined) {
            if(playable.card.type == CardType.POKEMON){
                this.currentEnergy = playable.currentEnergy;
                this.currentDamage = playable.currentDamage;
                if(! this.currentDamage){
                    this.currentDamage=0;
                }
            }
        }
    }
}