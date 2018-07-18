// import { GameStates, Card, EnergyCard, PokemonCard } from "../../../api/collections";
import {PlayableCard} from "../../../gameLogic/PlayableCard"
import { asyncCall } from "../../helpers";

export class MoveState{
    selectedEnergyCard: PlayableCard;
    selectedPokemonCard: PlayableCard;
    selectedEvolutionPokemonCard: PlayableCard;
    retreating:boolean;

    constructor() {
        this.selectedEnergyCard = null;
        this.selectedPokemonCard = null;
        this.selectedEvolutionPokemonCard = null;
        this.retreating=false;
    }
}
export class MoveStateController{

   static setEnergy(ms: MoveState, eCard: PlayableCard,energyPlayed:boolean){
        ms.selectedEvolutionPokemonCard=null;
        if(energyPlayed){
            return;
        }
        if(ms.selectedEnergyCard==null){
            ms.selectedEnergyCard= eCard;
            this.addEnergy(ms);
            // console.log(ms);
            return;
        }
        else if(eCard.id === ms.selectedEnergyCard.id){
            ms.selectedEnergyCard=null;
            // console.log(ms);
            return;
        }
        else{
            ms.selectedEnergyCard = eCard;
            this.addEnergy(ms);
            // console.log(ms);
            return;
        }
    }

    static setPokemon(ms: MoveState, pCard: PlayableCard){
        if(ms.selectedPokemonCard === null){
            ms.selectedPokemonCard = pCard;
        }
        else if(ms.selectedPokemonCard!=null){
            if(ms.selectedPokemonCard.id === pCard.id){
                ms.selectedPokemonCard=null;
            }
            else{
                ms.selectedPokemonCard = pCard;
            }

        }
        console.log(ms);

        if(ms.selectedEnergyCard){
            this.addEnergy(ms);
        }else if(ms.retreating){
            this.retreatPokemon(ms);
        }
        else{
            this.evolvePokemon(ms);
        }
    } 
    private static retreatPokemon(ms:MoveState){
        Meteor.call("retreatPokemon", true, ms.selectedPokemonCard);
        this.resetMoveState(ms);
    }
    private static  addEnergy(ms:MoveState){
        if(ms.selectedEnergyCard && ms.selectedPokemonCard){
            // console.log(ms);
            Meteor.call("addEnergy", true, ms.selectedPokemonCard, ms.selectedEnergyCard);
            this.resetMoveState(ms);
        }
    }

    static setEvolutionPokemon(ms:MoveState,pCard:PlayableCard){
        ms.selectedEnergyCard=null;
        if(ms.selectedEvolutionPokemonCard === null){
            ms.selectedEvolutionPokemonCard = pCard;
        }
        else if(pCard.id === ms.selectedEvolutionPokemonCard.id){
            ms.selectedEvolutionPokemonCard = null;           
            return;
        }
        console.log("set evolve: "+JSON.stringify(ms.selectedEvolutionPokemonCard))

        this.evolvePokemon(ms);

    }
    static setRetreat(ms:MoveState){
        if(ms.retreating){
            this.resetMoveState(ms);
        }
        else{
            this.resetMoveState(ms);
            ms.retreating=true;
        }
    }

    private static evolvePokemon(ms:MoveState){
        console.log("EVOL: "+ms.selectedEvolutionPokemonCard +"   " +ms.selectedPokemonCard)
        if(ms.selectedEvolutionPokemonCard && ms.selectedPokemonCard){
            
            if(ms.selectedEvolutionPokemonCard.card.evolution !==  ms.selectedPokemonCard.card.name){
                return;
            }
            
            else{
                Meteor.call("evolvePokemon", true, ms.selectedEvolutionPokemonCard, ms.selectedPokemonCard);
                this.resetMoveState(ms);
            }

        }
    }


    static resetMoveState(ms: MoveState){
        ms.selectedEnergyCard = null;
        ms.selectedPokemonCard = null;
        ms.selectedEvolutionPokemonCard = null;
        ms.retreating=false;
    }

    static isEmpty(ms){
        return ms.selectedEnergyCard === null&&ms.selectedPokemonCard === null&& ms.selectedEvolutionPokemonCard === null;
    }
}