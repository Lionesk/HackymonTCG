import {GameState} from './GameState';
import {Player} from "./Player";
import {PlayableCard} from "./PlayableCard";

export class GameManager{
    gameState:GameState;
    placedEnergy:boolean;

    constructor(){
        this.gameState = new GameState(Meteor.userId());
        this.gameState.humanFirst = this.coinFlip();
        this.placedEnergy = false;
    }

    /***
     * Generic coin flip method, used for abilities, trainer cards, and determining turn order.
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
     *
     * @param {number} n
     * @returns {GameState}
     */
    draw(player:Player, n?:number){
        let toDraw: number = n ? n : 1; //Assigning number of cards to draw to n if passed, else 1
        for(let i = 0; i < toDraw; i++){
            player.hand.push(player.deck.pop())
        }
        return this.gameState;
    }

    /***
     *
     * @returns {GameState}
     */
    attack(player:Player, opponent:Player, target?:PlayableCard){

        //TODO: Check if attack triggered a game ending condition: Drew all prize cards, knocked out all enemy pokemon
        return this.gameState;
    }

    /***
     *
     * @returns {GameState}
     */
    evolve(toEvolve:PlayableCard, evolution:PlayableCard){
        if(toEvolve.isPokemon() && evolution.isPokemon()){
            if(toEvolve.isBasic() && evolution.isEvolution()){
                //TODO: Additional check to validate that the two cards are compatible for evolution
                toEvolve.card = evolution.card;
            }
        }
        return this.gameState;
    }

    /***
     *
     * @returns {GameState}
     */
    addEnergy(player:Player, energy:PlayableCard, pokemon:PlayableCard){
        if(pokemon.isPokemon() && energy.isEnergy()){
            if(!this.placedEnergy && (player.active == pokemon || player.bench.includes(pokemon))){
                //Pokemon must either be active or on the bench
                pokemon.addEnergy(energy);
                this.removeFromHand(player, energy);
                this.placedEnergy = true;
            }
        }
        return this.gameState;
    }

    /***
     *
     * @returns {GameState}
     */
    placeActive(player:Player, card:PlayableCard){
        if(!player.active && card.isPokemon()){
            //Only possible if there is no active Pokemon and the card is a Pokemon type
            player.active = card;
            this.removeFromHand(player, card);
        }
        return this.gameState;
    }

    /***
     *
     * @returns {GameState}
     */
    placeBench(player:Player, card:PlayableCard){
        if(player.bench.length < 5 && card.isPokemon()){
            //Only possible if player has less than 5 Pokemon on the bench
            player.bench.push(card);
            this.removeFromHand(player, card);
        }
        return this.gameState;
    }

    removeFromHand(player:Player, card:PlayableCard){
        player.hand.filter(c => c !== card);
    }

    /***
     *
     * @returns {GameState}
     */
    playTrainer(){

        return this.gameState;
    }

    /***
     * Client will call this when the turn ends. Update the round number and instruct the AI to play.
     */
    endTurn(){
        this.placedEnergy = false;
        //TODO: Call the AI's play turn function
    }

}