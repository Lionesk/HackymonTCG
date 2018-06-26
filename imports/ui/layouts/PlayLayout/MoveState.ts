// import { GameStates, Card, EnergyCard, PokemonCard } from "../../../api/collections";
import {PlayableCard} from "../../../gameLogic/PlayableCard"

export class MoveState{
    selectedEnergyCard:PlayableCard;
    selectedPokemonCard:PlayableCard;
    selectedEvolutionPokemonCard:PlayableCard;

    constructor(){
        this.selectedEnergyCard=null;
        this.selectedPokemonCard=null;
        this.selectedEvolutionPokemonCard=null;
    }
}

export class MoveStateController{

   static setEnergy(ms:MoveState,eCard:PlayableCard){
        ms.selectedEvolutionPokemonCard=null;

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
            // else if(ms.selectedPokemonCard.card.evolution=pCard.card.name){//evolve case 1
            //     Meteor.call("evolvePokemon",ms.selectedPokemonCard,pCard);
            //     ms.selectedPokemonCard=null;                
            //     return;
            // }
            // else if(pCard.card.evolution=ms.selectedPokemonCard.card.name){ //evolve case2
            //     Meteor.call("evolvePokemon",pCard,ms.selectedPokemonCard);
            //     ms.selectedPokemonCard=null;
            //     return;
            // }
            else{
                ms.selectedPokemonCard=pCard;
            }

        }
        if(ms.selectedEnergyCard){
            this.addEnergy(ms);
        }else{
            this.evolvePokemon(ms);
        }
    } 

    private static addEnergy(ms:MoveState){
        if(ms.selectedEnergyCard && ms.selectedPokemonCard){
            let self = this;            
            Meteor.call("addEnergy",ms.selectedPokemonCard,ms.selectedEnergyCard,function(){
                self.resetMoveState(ms);                
            })
            this.resetMoveState(ms);
        }
    }

    static setEvolutionPokemon(ms:MoveState,pCard:PlayableCard){
        ms.selectedEnergyCard=null;
        if(ms.selectedEvolutionPokemonCard==null){
            ms.selectedEvolutionPokemonCard = pCard;
        }
        else if(pCard.card.name === ms.selectedEvolutionPokemonCard.card.name){
            ms.selectedEvolutionPokemonCard = null;           
            return;
        }
        console.log("set evolve: "+JSON.stringify(ms.selectedEvolutionPokemonCard))

        this.evolvePokemon(ms);

    }

    private static evolvePokemon(ms:MoveState){
        
        if(ms.selectedEvolutionPokemonCard && ms.selectedPokemonCard){
            
            if(ms.selectedEvolutionPokemonCard.card.evolution !==  ms.selectedPokemonCard.card.name){
                return;
            }
            
            else{
                let self = this;
                Meteor.call("evolvePokemon",ms.selectedEvolutionPokemonCard,ms.selectedPokemonCard,function(){
                  self.resetMoveState(ms);
                })
                this.resetMoveState(ms);
            }

        }
    }


    private static resetMoveState(ms:MoveState){
        ms.selectedEnergyCard = null;
        ms.selectedPokemonCard = null;
        ms.selectedEvolutionPokemonCard=null;
    }
}