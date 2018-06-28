import {Player} from "./Player";
import {PlayableCard} from "./PlayableCard";
import {Cards, CardType, Decks, EnergyCard, GameStates} from "../api/collections";
import {Deck} from "../api/collections/Deck";
import {GameState} from "./GameState";

export module GameManager {
    /***
     * Generic coin flip method, used for abilities, trainer cards, and determining turn order. Heads is true, tails
     * is false.
     * @returns {boolean}
     */
    export function coinFlip() {
        return (Math.floor(Math.random() * 2) == 0);
    }

    export function shuffleDeck(deck: PlayableCard[]) {
        let i = deck.length, temp, random;
        while (i !== 0) {
            random = Math.floor(Math.random() * i);
            i--;

            temp = deck[i];
            deck[i] = deck[random];
            deck[random] = temp;
        }
        return deck;
    }

    export function placePrizeCards(player: Player) {
        for(let i = 0; i < 6; i++){
            player.prize.push(player.deck.pop());
        }
    }

    export function initializeGame(shuffle: boolean){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        if(state.ai.deck && state.player.deck){
            //Checking if the decks exist as a proxy for whether a game is going on, there is likely a better solution
            return
        }
        state = new GameState(Meteor.userId());
        state.humanFirst = coinFlip(); //Human always _chooses_ heads

        console.log('Creating new game from uploaded deck.');

        let deck: Deck = Decks.find({userid:Meteor.userId()}).fetch()[0];
        state.player.deck = generateDeck(deck.deckcards, shuffle);
        state.ai.deck = generateDeck(deck.deckcards, true);

        GameStates.update({userid: Meteor.userId()}, state);

        console.log('AI drawing cards.');
        drawPlayer(state.ai, 7);
        //TODO: Check for AI Mulligan

        console.log('Player drawing cards.');
        drawPlayer(state.player, 7);
        //TODO: Check for human mulligan

        GameStates.update({userid: Meteor.userId()}, state);

        console.log('Placing prize cards');
        placePrizeCards(state.player);
        placePrizeCards(state.ai);

        console.log('Game initialization done, updating the DB.');
        GameStates.update({userid: Meteor.userId()}, state);
    }

    /***
     * Generating a deck from a list of numbers, which are the lookup indices for the defined card set in the DB. For
     * each card, a PlayableCard wrapper is created and added to the deck, with an ID, for referencing purposes when
     * the app is running.
     * @param {Player} player
     * @param {number[]} deck
     */
    export function generateDeck(deck: number[], shuffle: boolean){
        let newDeck: PlayableCard[] = [];
        let counter: number = 0;
        for(let i in deck){
            let card = Cards.find().fetch()[i];
            newDeck.push(new PlayableCard(counter++, card));
        }
        if(shuffle){
            newDeck = shuffleDeck(newDeck);
        }
        return newDeck;
    }

    export function draw(humanPlayer: boolean, n?:number){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        let toDraw: number = n ? n : 1; //Assigning number of cards to draw to n if passed, else 1
        for(let i = 0; i < toDraw; i++) {
            if(player.deck.length === 0){
                //TODO: End the game here (LOSS)
            }
            player.hand.push(player.deck.pop());
        }
        GameStates.update({userid: Meteor.userId()}, state);
    }

    /***
     * Overloaded Draw function for internal GameManager calls where game state is already loaded.
     * @param {Player} player
     * @param {number} n
     */
    function drawPlayer(player: Player, n?: number){
        let toDraw: number = n ? n : 1; //Assigning number of cards to draw to n if passed, else 1
        for(let i = 0; i < toDraw; i++) {
            if(player.deck.length === 0){
                //TODO: End the game here (LOSS)
            }
            player.hand.push(player.deck.pop());
        }
    }

    export function attack(player:Player, opponent:Player, target?:PlayableCard){
        //TODO: Check if attack triggered a game ending condition: Drew all prize cards, knocked out all enemy pokemon
    }

    export function evolve(humanPlayer: boolean, toEvolve: PlayableCard, evolution: PlayableCard) {
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if(isPokemon(toEvolve) && isPokemon(evolution)){
            toEvolve = mapCardCopy(player, toEvolve);
            evolution = mapCardCopy(player, evolution, true);
            if(player.hand.includes(evolution) && (player.bench.includes(toEvolve) ||
                player.bench.includes(toEvolve))){
                if (evolution.card.evolution === toEvolve.card.name) {
                    toEvolve.card = evolution.card;
                    removeFromHand(player, evolution)
                }
            }
        }
        GameStates.update({userid: Meteor.userId()}, state);
    }

    export function addEnergy(humanPlayer: boolean, pokemon: PlayableCard, energy:PlayableCard){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if(isPokemon(pokemon) && isEnergy(energy)){
            pokemon = mapCardCopy(player, pokemon);
            energy = mapCardCopy(player, energy, true);
            if(pokemon !== null && energy !== null){
                //Pokemon must either be active or on the bench
                addEnergyToCard(pokemon, energy);
                removeFromHand(player, energy);
            }
        }
        GameStates.update({userid: Meteor.userId()}, state);
    }

    export function placeActive(humanPlayer: boolean, card:PlayableCard){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        card = mapCardCopy(player, card, true)
        if(!player.active && isPokemon(card)){
            //Only possible if there is no active Pokemon and the card is a Pokemon type
            player.active = card;
            removeFromHand(player, card);
        }
        return this.gameState;
    }

    export function placeBench(humanPlayer: boolean, card:PlayableCard){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        let pokemonCard = mapCardCopy(player, card, true)
        if(player.bench.length < 5 && isPokemon(pokemonCard)){
            //Only possible if player has less than 5 Pokemon on the bench
            player.bench.push(pokemonCard);
            removeFromHand(player, pokemonCard);
        }
        GameStates.update({userid: Meteor.userId()}, state);
    }

    /***
     * Helper function for removing a card from a players hand, using the Array filter method.
     * @param {Player} player
     * @param {PlayableCard} card
     */
    function removeFromHand(player:Player, card:PlayableCard){
        player.hand = player.hand.filter(c => c !== card);
        player.hand = cleanHand(player.hand);
    }

    export function playTrainer(){
        //TODO: Implement simple (non-exceptional) trainer cards
    }

    /***
     * The Card objects passed by the client side code are merely copies, and so in order to accurately affect the game
     * state we need to map them to objects in the GameState object in memory using their IDs
     * @param {Player} player
     * @param {PlayableCard} card
     * @param {boolean} hand -> used for specifying that we are trying to get a card out of the hand
     * @returns {PlayableCard}
     */
    function mapCardCopy(player: Player, card: PlayableCard, hand?: boolean){
        let playableCard: PlayableCard;
        if(hand) {
            playableCard = player.hand.find(function (element) {
                return element.id === card.id
            });
        }
        else {
            if(card.id === player.active.id){
                playableCard = player.active;
            }
            else{
                playableCard = player.bench.find(function (element) {
                    return element.id === card.id
                });
            }
        }
        return playableCard;
    }

    function isPokemon(playableCard: PlayableCard){
        return playableCard.card.type === CardType.POKEMON;
    }

    function isEnergy(playableCard: PlayableCard){
        return playableCard.card.type === CardType.ENERGY;
    }

    function addEnergyToCard(pokemonCard: PlayableCard, energyCard: PlayableCard){
        console.log('Adding ' + energyCard.card.name + ' energy to ' + pokemonCard.card.name);
        pokemonCard.currentEnergy.push(energyCard.card);
    }

    function cleanHand(hand:PlayableCard[]){
        return hand.filter(playableCard => !!playableCard);
    }

}