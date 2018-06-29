import { Player } from "./Player";
import { PlayableCard } from "./PlayableCard";
import { Cards, CardType, Decks, EnergyCard, GameStates, AbilityType } from "../api/collections";
import { Deck } from "../api/collections/Deck";
import { GameState } from "./GameState";
import { AbilityAction, Abilities } from "../api/collections/abilities";
import { Cost, AbilityReference } from "../api/collections/Cards";

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
        for (let i = 0; i < 6; i++) {
            player.prize.push(player.deck.pop());
        }
    }

    export function initializeGame(shuffle: boolean) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        if (state.ai.deck && state.player.deck) {
            //Checking if the decks exist as a proxy for whether a game is going on, there is likely a better solution
            return
        }
        state = new GameState(Meteor.userId());
        state.humanFirst = coinFlip(); //Human always _chooses_ heads

        console.log('Creating new game from uploaded deck.');

        let deck: Deck = Decks.find({ userid: Meteor.userId() }).fetch()[0];
        state.player.deck = generateDeck(deck.deckcards, shuffle);
        state.ai.deck = generateDeck(deck.deckcards, true);

        GameStates.update({ userid: Meteor.userId() }, state);

        console.log('AI drawing cards.');
        drawPlayer(state.ai, 7);
        //TODO: Check for AI Mulligan

        console.log('Player drawing cards.');
        drawPlayer(state.player, 7);
        //TODO: Check for human mulligan

        GameStates.update({ userid: Meteor.userId() }, state);

        console.log('Placing prize cards');
        placePrizeCards(state.player);
        placePrizeCards(state.ai);

        console.log('Game initialization done, updating the DB.');
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    /***
     * Generating a deck from a list of numbers, which are the lookup indices for the defined card set in the DB. For
     * each card, a PlayableCard wrapper is created and added to the deck, with an ID, for referencing purposes when
     * the app is running.
     * @param {Player} player
     * @param {number[]} deck
     */
    export function generateDeck(deck: number[], shuffle: boolean) {
        let newDeck: PlayableCard[] = [];
        let counter: number = 0;
        for(let i of deck){
            let card = Cards.find({index: i}).fetch()[0];
            newDeck.push(new PlayableCard(counter++, card));
        }
        if (shuffle) {
            console.log("SHUFFLING " + shuffle);
            console.log(shuffle);
            newDeck = shuffleDeck(newDeck);
        }
        return newDeck;
    }

    export function draw(humanPlayer: boolean, n?: number) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        let toDraw: number = n ? n : 1; //Assigning number of cards to draw to n if passed, else 1
        for (let i = 0; i < toDraw; i++) {
            if (player.deck.length === 0) {
                //TODO: End the game here (LOSS)
            }
            player.hand.push(player.deck.pop());
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function finishFirstRound(){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        state.isFirstRound=false;
        GameStates.update({userid: Meteor.userId()}, state);
    }
    /***
     * Overloaded Draw function for internal GameManager calls where game state is already loaded.
     * @param {Player} player
     * @param {number} n
     */
    export function drawPlayer(player: Player, n?: number){
        let toDraw: number = n ? n : 1; //Assigning number of cards to draw to n if passed, else 1
        for (let i = 0; i < toDraw; i++) {
            if (player.deck.length === 0) {
                //TODO: End the game here (LOSS)
            }
            player.hand.push(player.deck.pop());
        }
    }

    export function attack(player: Player, opponent: Player, target?: PlayableCard) {
        //TODO: Check if attack triggered a game ending condition: Drew all prize cards, knocked out all enemy pokemon
    }

    export function evolve(humanPlayer: boolean, toEvolve: PlayableCard, evolution: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if (isPokemon(toEvolve) && isPokemon(evolution)) {
            toEvolve = mapCardCopy(player, toEvolve);
            evolution = mapCardCopy(player, evolution, true);
            if (player.hand.includes(evolution) && (player.bench.includes(toEvolve) ||
                player.bench.includes(toEvolve))) {
                if (evolution.card.evolution === toEvolve.card.name) {
                    toEvolve.card = evolution.card;
                    removeFromHand(player, evolution)
                }
            }
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function addEnergy(humanPlayer: boolean, pokemon: PlayableCard, energy:PlayableCard){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        if(humanPlayer && state.energyPlayed){
            return;
        }
        let player: Player = humanPlayer ? state.player : state.ai;
        if (isPokemon(pokemon) && isEnergy(energy)) {
            pokemon = mapCardCopy(player, pokemon);
            energy = mapCardCopy(player, energy, true);
            //Pokemon must either be active or on the bench
            addEnergyToCard(pokemon, energy);
            removeFromHand(player, energy);
            if(humanPlayer){
                state.energyPlayed=true;
            }else{
                state.energyPlayed=false;
            }
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function placeActive(humanPlayer: boolean, card: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        card = mapCardCopy(player, card, true)
        if (!player.active && isPokemon(card)) {
            //Only possible if there is no active Pokemon and the card is a Pokemon type
            player.active = card;
            removeFromHand(player, card);
        }
        GameStates.update({userid: Meteor.userId()}, state);
    }

    export function placeBench(humanPlayer: boolean, card: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if(!player.active){
            placeActive(true,card);
            return;
        }
        let pokemonCard = mapCardCopy(player, card, true)
        if (player.bench.length < 5 && isPokemon(pokemonCard)) {
            //Only possible if player has less than 5 Pokemon on the bench
            player.bench.push(pokemonCard);
            removeFromHand(player, pokemonCard);
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    /***
     * Helper function for removing a card from a players hand, using the Array filter method.
     * @param {Player} player
     * @param {PlayableCard} card
     */
    function removeFromHand(player: Player, card: PlayableCard) {
        player.hand = player.hand.filter(c => c !== card);
        player.hand = cleanHand(player.hand);
    }

    export function playTrainer() {
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
    function mapCardCopy(player: Player, card: PlayableCard, hand?: boolean) {
        let playableCard: PlayableCard;
        if(player.active && player.active.id === card.id){
            return player.active;
        }
        playableCard = player.hand.find(function (element) {
            return element.id === card.id
        });
        if(playableCard !== undefined){
            return playableCard;
        }
        playableCard = player.bench.find(function (element) {
            return element.id === card.id
        });
        return playableCard;
    }

    function isPokemon(playableCard: PlayableCard) {
        return playableCard.card.type === CardType.POKEMON;
    }

    function isEnergy(playableCard: PlayableCard) {
        return playableCard.card.type === CardType.ENERGY;
    }

    function addEnergyToCard(pokemonCard: PlayableCard, energyCard: PlayableCard) {
        console.log('Adding ' + energyCard.card.name + ' energy to ' + pokemonCard.card.name);
        pokemonCard.currentEnergy.push(energyCard.card);
    }

    function cleanHand(hand: PlayableCard[]) {
        return hand.filter(playableCard => !!playableCard);
    }

    function applyDamage(target: PlayableCard, damage: number) {
        target.currentDamage += damage;
    }

    export function executeAbility(humanPlayer: boolean, source: PlayableCard, abilityIndex: number, selectedTarget?: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        
        source = mapCardCopy(player, source);
        
        const ability: AbilityReference = source.card.abilities.find((ability) => ability.index === abilityIndex);
        if (!ability) {
            console.log("ability not found on card");
            return;
        }
        switch (source.card.type) {
            case CardType.POKEMON:
                if (checkCost(ability.cost, source.currentEnergy as EnergyCard[])) {
                    castAbility(ability, player, selectedTarget);
                }
                break;
            // run ability
            case CardType.TRAINER:
                castAbility(ability, player, selectedTarget);
                break;
            default:
                console.log("Invalid card");
                return;

        }

        // update model
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    function checkCost(abilityCost: Cost, cardEnergy: EnergyCard[]): boolean {
        const AvailableEnergy = cardEnergy.reduce<Cost>((acc, element) => {
            if (acc[element.type]) {
                acc.colorless += 1;
                acc[element.type] += 1
            } else {
                acc.colorless = acc.colorless ? acc.colorless + 1 : 1;
                acc[element.type] = 1;
            }

            return acc;
        }, {});

        Object.keys(abilityCost).reduce<boolean>((isCastable, index) => {
            if (isCastable && abilityCost[index] > AvailableEnergy) {
                return false;
            }
            return isCastable;
        }, true);

        return false;
    }

    function castAbility(abilRef: AbilityReference, player: Player, selectedTarget?: PlayableCard) {
        let target: PlayableCard;
        if (selectedTarget) {
            target = selectedTarget;
        } else  {
            target = player.active;
        }
        Abilities.find({ index: abilRef.index }).fetch()[0].actions.forEach((ability: AbilityAction) => {
            switch (ability.type) {
                case AbilityType.DAMAGE:
                    applyDamage(target, ability.amount);
                    break;
                default:
                    console.log(`${ability.type} is not implemented yet`)
            }
        });
    }
}