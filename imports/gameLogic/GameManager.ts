import {GameState} from './GameState';

export class GameManager{
    gameState:GameState;

    constructor(){
        this.gameState = new GameState(Meteor.userId());
        this.gameState.humanFirst = this.coinFlip();
    }

    /***
     * For determining the turn order.
     * @returns {boolean}
     */
    coinFlip() {
        return (Math.floor(Math.random() * 2) == 0);
    }

    generateDeck(userID:String, deckID:String){
        //TODO: Complete this function

        /***
         * Idea is that this function will get the list of card numbers for a particular deck, and then iterate through
         * them, creating an instance of the PlayableCard wrapper for each, and putting them into an ArrayList. Once
         * that's done the ArrayList is assigned to the deck parameter for the player.
         **/
    }

    /***
     * Client will call this when the turn ends. Update the round number and instruct the AI to play.
     */
    endTurn(){
        this.gameState.round++;
        //TODO: Call the AI's play turn function
    }

}