import {PlayableCard} from "../gameLogic/PlayableCard";
import {Cards, CardType, Decks, EnergyCard, GameStates} from "../api/collections";
import {GameState} from "../gameLogic/GameState";
import {GameManager} from "../gameLogic/GameManager";
import { AbilityReference, PokemonCard } from "../api/collections/Cards";

export module AI {

    export function playTurn(){
        playTurnFromState();
    }

    export function playTurnFromState(){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        GameManager.draw(false);
        if(!state.ai.active) {
            if(!state.ai.active){
                let benchCard = findPokemon(state.ai.bench,true);
                let handCard = findPokemon(state.ai.hand,true);
                if(benchCard){
                    GameManager.placeActive(false, benchCard);
                }else if(handCard){
                    GameManager.placeActive(false, handCard);
                }else{
                    //TODO:AI lose
                }
            }

        }
        else if(state.ai.bench.length < 5){
            if(state.isFirstRound){
                console.log("firstround")
                return;
            }
            let card = findPokemon(state.ai.hand);
            for(let i=0;i<5;i++){
                state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
                card = findPokemon(state.ai.hand,true);
                if(card)
                console.log("cardfound: "+ card.card.name)
                if(card&&state.ai.bench.length < 5){
                    console.log("cardfound: "+ card.card.name)
                    if(!card.card.evolution){
                        GameManager.placeBench(false, card);
                    }
                }
                else {
                    console.log('AI player has no cards to place on the bench.');
                }
            }
        }
        if(state.isSecondRound){
            return;
        }
        state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let energyCard = findEnergy(state.ai.hand);
        if(state.ai.active && energyCard) {
            if(state.ai.active.currentEnergy.length < 4){
                GameManager.addEnergy(false, state.ai.active, energyCard);
            }
            else{
                for(let card of state.ai.bench){
                    if(card && card.currentEnergy.length < 3){
                        GameManager.addEnergy(false, card, energyCard);
                        break;
                    }
                }
            }
        }
        if(state.ai.active){
            GameManager.executeAbility(false,state.ai.active, (state.ai.active.card.abilities as AbilityReference[])[0].index)
        }
        //TODO: Try to attack and/or use a trainer card
        console.log('Ending turn');
    }

    function findPokemon(array: PlayableCard[], basic?: boolean): PlayableCard<PokemonCard> | null {
        for(let card of array){
            try {
                if (card.card.type === CardType.POKEMON) {
                    if (basic) {
                        if (card.card.evolution) {
                            continue
                        }
                    }
                    return card as PlayableCard<PokemonCard>;
                }
            }
            catch(err) {
                console.log('Card ' + card + ' is missing parameter "card"');
            }
        }
        return null;
    }

    function findEnergy(hand: PlayableCard[]): PlayableCard<EnergyCard> | null {
        for(let card of hand){
            if(card.card.type === CardType.ENERGY){
                console.log('Found an energy card');
                return card as PlayableCard<EnergyCard>;
            }
        }
        console.log('Did not find an enery card');
        return null;
    }
}