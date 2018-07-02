import {PlayableCard} from "../gameLogic/PlayableCard";
import {Cards, CardType, Decks, EnergyCard, GameStates} from "../api/collections";
import {GameState} from "../gameLogic/GameState";
import {GameManager} from "../gameLogic/GameManager";

export module AI {

    export function playTurn(){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        playTurnFromState(state);
    }

    export function playTurnFromState(state: GameState){
        GameManager.draw(false);
        if(state.ai.active === undefined) {
            state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
            let card = findPokemon(state.ai.hand);
            if (card !== undefined) {
                GameManager.placeActive(false, card);
            }
            else {
                //TODO: Look for card in the bench to place in active
            }
            if(state.isFirstRound){
                return;
            }
        }
        else if(state.ai.bench.length < 5){
            state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
            let card = findPokemon(state.ai.hand);
            if(card){
                GameManager.placeBench(false, card);
            }
            else {
                console.log('AI player has no cards to place on the bench.');
            }
        }
        state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let energyCard = findEnergy(state.ai.hand);
        if(energyCard !== undefined){
            if(state.ai.active.currentEnergy.length < 4){
                GameManager.addEnergy(false, state.ai.active, energyCard);
            }
            else{
                for(let card of state.ai.bench){
                    if(card !== undefined && card.currentEnergy.length < 3){
                        GameManager.addEnergy(false, card, energyCard);
                        break;
                    }
                }
            }
        }
        if(state.ai.active){
            GameManager.executeAbility(false,state.ai.active,state.ai.active.card.abilities[0].index)
        }
        //TODO: Try to attack and/or use a trainer card
        console.log('Ending turn');
    }

    function findPokemon(array: PlayableCard[], basic?: boolean) {
        for(let card of array){
            if(card.card.type === CardType.POKEMON){
                if(basic){
                    if(card.card.evolution){
                        continue
                    }
                }
                return card;
            }
        }
        return null;
    }

    function findEnergy(hand: PlayableCard[]) {
        for(let card of hand){
            if(card.card.type === CardType.ENERGY){
                console.log('Found an energy card');
                return card;
            }
        }
        console.log('Did not find an enery card');
        return undefined
    }
}