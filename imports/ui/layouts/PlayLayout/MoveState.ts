// import { GameStates, Card, EnergyCard, PokemonCard } from "../../../api/collections";
import {PlayableCard} from "../../../gameLogic/PlayableCard"
import { asyncCall } from "../../helpers";

export class MoveState{
    selectedEnergyCard: PlayableCard;
    selectedPokemonCard: PlayableCard;
    selectedEvolutionPokemonCard: PlayableCard;

    constructor() {
        this.selectedEnergyCard = null;
        this.selectedPokemonCard = null;
        this.selectedEvolutionPokemonCard = null;
    }
}

export class MoveStateController{

   static async setEnergy(ms: MoveState, eCard: PlayableCard){
        ms.selectedEvolutionPokemonCard=null;

        if(ms.selectedEnergyCard==null){
            ms.selectedEnergyCard= eCard;
            await this.addEnergy(ms);
            return;
        }
        else if(eCard.card.name === ms.selectedEnergyCard.card.name){
            ms.selectedEnergyCard = null;
            return;
        }
        else{
            ms.selectedEnergyCard = eCard;
            await this.addEnergy(ms);
            return;
        }
    }

    static async setPokemon(ms: MoveState, pCard: PlayableCard){
        if(ms.selectedPokemonCard === null){
            ms.selectedPokemonCard = pCard;
        }
        else
        {
            if(ms.selectedPokemonCard.card.name === pCard.card.name){
                ms.selectedPokemonCard = null;
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
                ms.selectedPokemonCard = pCard;
            }

            if(ms.selectedEnergyCard){
                await this.addEnergy(ms);
            }else{
                await this.evolvePokemon(ms);
            }
        }
    } 

    private static async addEnergy(ms:MoveState){
        if(ms.selectedEnergyCard && ms.selectedPokemonCard){
            console.log(ms);
            await asyncCall("addEnergy", true, ms.selectedPokemonCard, ms.selectedEnergyCard);
            this.resetMoveState(ms);
        }
    }

    static async setEvolutionPokemon(ms:MoveState,pCard:PlayableCard){
        ms.selectedEnergyCard=null;
        if(ms.selectedEvolutionPokemonCard === null){
            ms.selectedEvolutionPokemonCard = pCard;
        }
        else if(pCard.card.name === ms.selectedEvolutionPokemonCard.card.name){
            ms.selectedEvolutionPokemonCard = null;           
            return;
        }
        console.log("set evolve: "+JSON.stringify(ms.selectedEvolutionPokemonCard))

        await this.evolvePokemon(ms);

    }

    private static async evolvePokemon(ms:MoveState){
        
        if(ms.selectedEvolutionPokemonCard && ms.selectedPokemonCard){
            
            if(ms.selectedEvolutionPokemonCard.card.evolution !==  ms.selectedPokemonCard.card.name){
                return;
            }
            
            else{
                let self = this;
                await asyncCall("evolvePokemon", ms.selectedEvolutionPokemonCard, ms.selectedPokemonCard);
                this.resetMoveState(ms);
            }

        }
    }


    private static resetMoveState(ms: MoveState){
        ms.selectedEnergyCard = null;
        ms.selectedPokemonCard = null;
        ms.selectedEvolutionPokemonCard = null;
    }
}