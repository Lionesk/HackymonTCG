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
            }
        }
    }

    countEnergyOfType(energyCat:EnergyCat){
        let energy=0;

        this.currentEnergy.forEach((eCard)=>{
            if(eCard.category = energyCat){
                energy++;
            }
        });

        return energy;
    }

    getAllEnergyList(){
        let eList={};
        Object.keys(EnergyCat).filter((key)=>{
            let eCount = this.countEnergyOfType(EnergyCat[key]);
            eList[EnergyCat[key]]=eCount;
        });
        return eList;
    }
    

}