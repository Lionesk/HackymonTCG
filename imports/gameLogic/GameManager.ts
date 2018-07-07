import { Player } from "./Player";
import { PlayableCard, CardPosition } from "./PlayableCard";
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

    export function shuffleDeck(deck: PlayableCard[], deckIndex: number = 0) {
        let i = deck.length - deckIndex;
        let temp: PlayableCard;
        let random: number;
        while (i !== deckIndex) {
            random = Math.floor(Math.random() * i) + deckIndex;
            i--;

            temp = deck[i];
            deck[i] = deck[random];
            deck[random] = temp;
        }
        return deck;
    }

    export function placePrizeCards(player: Player) {
        for (let i = 0; i < 6; i++) {
            player.prize.push(player.deck.pop() as PlayableCard);
            player.inPlay[player.deckIndex++].position = CardPosition.PRIZE;
        }
    }

    export function initializeGame(shuffle: boolean) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        if (state.playing) {
            return
        }
        state = new GameState(Meteor.userId());
        state.humanFirst = coinFlip(); //Human always _chooses_ heads

        console.log('Creating new game from uploaded deck.');

        let deck: Deck = Decks.find({ userid: Meteor.userId() }).fetch()[0];
        state.player.deck = generateDeck(deck.deckcards, shuffle);
        state.player.inPlay = state.player.deck.slice(); // copy actual deck

        state.ai.deck = generateDeck(deck.deckcards, true);
        state.ai.inPlay = state.ai.deck.slice(); // copy actual deck

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
        state.playing = true;
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    /***
     * Generating a deck from a list of numbers, which are the lookup indices for the defined card set in the DB. For
     * each card, a PlayableCard wrapper is created and added to the deck, with an ID, for referencing purposes when
     * the app is running.
     * @param {Player} player
     * @param {number[]} deck
     */
    export function generateDeck(deck: number[], shuffle: boolean): PlayableCard[] {
        let counter: number = 0;
        let newDeck: PlayableCard[] =  deck.map(((index: number) => new PlayableCard(counter++, Cards.find({ index }).fetch()[0])));
        // for(let i of deck){
        //     let card = Cards.find({index: i}).fetch()[0];
        //     newDeck.push(new PlayableCard(counter++, card));
        // }
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
            player.hand.push(player.deck.pop() as PlayableCard);
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function resetRoundParams(){
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        state.isFirstRound=false;
        state.energyPlayed=false;
        GameStates.update({userid: Meteor.userId()}, state);
    }
    /***
     * Overloaded Draw function for internal GameManager calls where game state is already loaded.
     * 
     * TODO move to player
     * 
     * @param {Player} player
     * @param {number} n
     */
    export function drawPlayer(player: Player, n: number = 1){
        for (let i = 0; i < n; i++) {
            if (player.deck.length === 0) {
                //TODO: End the game here (LOSS)
            }
            player.inPlay[player.deckIndex++].position = CardPosition.HAND;
            player.hand.push(player.deck.pop() as PlayableCard);
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
            }
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function placeActive(humanPlayer: boolean, card: PlayableCard) {
        console.log("placing to active called")
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        card = mapCardCopy(player, card, true)
        if (!player.active && isPokemon(card)) {
            //Only possible if there is no active Pokemon and the card is a Pokemon type
            player.active = card;
            console.log("placing to active")
            card.position = CardPosition.ACTIVE;
            removeFromHand(player, card);
            removeFromBench(player,player.active);
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
            card.position = CardPosition.BENCH;
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
    function removeFromBench(player: Player, card: PlayableCard){
        player.bench = player.bench.filter(c => c !== card);
        
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
        let playableCard: PlayableCard | undefined;
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
        if (!playableCard) {
            throw new Error(`Card #${card.id} does not exist in DB`);
        }
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
        if(!target || !target.card || !target.card.healthPoints){
            return false;
        }

        target.currentDamage += damage;
        // console.log( target.currentDamage)
        // console.log( target.card.healthPoints)

        if(target.currentDamage > target.card.healthPoints){
            // target=null;
            console.log("DIE")
            //TODO: send to discard
            target.position = CardPosition.DISCARD;
        }
        return true;
    }

    export function executeAbility(humanPlayer: boolean, source: PlayableCard, abilityIndex: number, selectedTarget?: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        let opponent: Player = humanPlayer ? state.ai : state.player;
        
        source = mapCardCopy(player, source);

        if (!source.card.abilities) {
            throw new Error("Card has no abilities to execute");
        }
        
        const ability = source.card.abilities.find((ability) => ability.index === abilityIndex);
        if (!ability) {
            console.log("ability not found on card");
            return;
        }
        let didPokemonAttack=false;
        switch (source.card.type) {
            case CardType.POKEMON:
                if (ability.cost && checkCost(ability.cost, source.currentEnergy as EnergyCard[])) {
                    didPokemonAttack= castAbility(ability, player, opponent, selectedTarget);
                }
                break;
            // run ability
            case CardType.TRAINER:
                castAbility(ability, player, opponent, selectedTarget);
                break;
            default:
                console.log("Invalid card");
                return;

        }

        // update model
        GameStates.update({ userid: Meteor.userId() }, state);
        if(didPokemonAttack && humanPlayer){
            Meteor.call("endTurn");
        }
    }

    function checkCost(abilityCost: Cost, cardEnergy: EnergyCard[]): boolean {
        const AvailableEnergy: Cost = cardEnergy.reduce<Cost>((acc, element) => {
            acc.colorless = acc.colorless ? acc.colorless + 1 : 1;
            acc[element.category] = (acc[element.category] || 0) + 1;

            return acc;
        }, {});

        return Object.keys(abilityCost).reduce<boolean>((isCastable, index: keyof Cost) => {
            //  abilityCost[index] will always be defined
            if (isCastable && abilityCost[index] as number > AvailableEnergy) {
                return false;
            }
            return isCastable;
        }, true);
    }

    function castAbility(abilRef: AbilityReference, player: Player, opponent: Player, selectedTarget?: PlayableCard): boolean {
        let target: PlayableCard;
        if (selectedTarget) {
            target = selectedTarget;
        } else  {
            target = opponent.active;
        }
        let appliedDamage=false;
        Abilities.find({ index: abilRef.index }).fetch()[0].actions.forEach((ability: AbilityAction) => {
            switch (ability.type) {
                case AbilityType.DAMAGE:
                // console.log("t"+parseInt(ability.amount));
                    if (ability.amount) {
                        appliedDamage = applyDamage(target, ability.amount);
                    } else {
                        throw new Error("Damage ability must have amount");
                    }
                    break;
                default:
                    console.log(`${ability.type} is not implemented yet`)
                    appliedDamage = false;
            }
        });
        return appliedDamage
    }
}