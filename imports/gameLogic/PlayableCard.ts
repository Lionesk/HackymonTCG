import {Card, CardType, PokemonCard, EnergyCard, EnergyCat} from '../api/collections';


export class PlayableCard{
    
    card:Card;
    currentDamage:number;
    currentEnergy:[EnergyCard];
    
    constructor(card?:Card, playable?:PlayableCard){
        if(card!==undefined){
            if(card.type == CardType.POKEMON){
                this.currentDamage = 0;
            }
        }
        if(playable!==undefined){
            if(playable.card.type == CardType.POKEMON){
                this.currentEnergy=playable.currentEnergy;
                this.currentDamage = playable.currentDamage;
            }
        }
        if(card!==undefined && playable!==undefined){
            this.currentDamage=null;
        }
        this.card=card; 
    }

    isPokemon(){
        return this.card.type == CardType.POKEMON;
    }

    addEnergy(energyCard:EnergyCard){ 

        //TODO: check type is acceptable by pokemon
        this.currentEnergy.concat(energyCard);
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