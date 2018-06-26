// import { GameStates, Card, EnergyCard, PokemonCard } from "../../../api/collections";
import {PlayableCard} from "../../../gameLogic/PlayableCard"

export class MoveState{
    selectedEnergyCard:PlayableCard;
    selectedPokemonCard:PlayableCard;

    constructor(){
        this.selectedEnergyCard=null;
        this.selectedPokemonCard=null;
    }
}

export class MoveStateController{

   static setEnergy(ms:MoveState,eCard:PlayableCard){

        if(ms.selectedEnergyCard==null){
            ms.selectedEnergyCard= eCard;
            this.addEnergy(ms);
            return;
        }
        else if(eCard.card.name === ms.selectedEnergyCard.card.name){
            ms.selectedEnergyCard=null;
            return;
        }
        else{
            ms.selectedEnergyCard= eCard;
            this.addEnergy(ms);
            return;
        }
    }

    static setPokemon(ms:MoveState,pCard:PlayableCard){
        if(ms.selectedPokemonCard==null){
            ms.selectedPokemonCard=pCard;
        }
        else if(ms.selectedPokemonCard!=null){
            if(ms.selectedPokemonCard.card.name === pCard.card.name){
                ms.selectedPokemonCard=null;
            }
            else if(ms.selectedPokemonCard.card.evolution=pCard.card.name){//evolve case 1
                Meteor.call("evolvePokemon",ms.selectedPokemonCard,pCard);
                ms.selectedPokemonCard=null;                
                return;
            }
            else if(pCard.card.evolution=ms.selectedPokemonCard.card.name){ //evolve case2
                Meteor.call("evolvePokemon",pCard,ms.selectedPokemonCard);
                ms.selectedPokemonCard=null;
                return;
            }
            else{
                ms.selectedPokemonCard=pCard;
            }

        }
        
        this.addEnergy(ms);
    } 

    private static addEnergy(ms:MoveState){
        if(ms.selectedEnergyCard && ms.selectedPokemonCard){
            Meteor.call("addEnergy",ms.selectedPokemonCard,ms.selectedEnergyCard,function(){
                ms.selectedEnergyCard = null
                ms.selectedPokemonCard = null;
            })
            ms.selectedEnergyCard = null
            ms.selectedPokemonCard = null;
        }
    }
}