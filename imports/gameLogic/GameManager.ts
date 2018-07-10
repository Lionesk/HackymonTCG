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

    export function initializeGame(shuffle: boolean,playerDeckId?:string,aiDeckId?:string) {
        if(playerDeckId&&aiDeckId){
            GameStates.update({userid:Meteor.userId()},new GameState(Meteor.userId()),{upsert:true});            
        }

        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];

        if ((state.ai.deck && state.player.deck)) {
            //Checking if the decks exist as a proxy for whether a game is going on, there is likely a better solution
            return
        }

        state = new GameState(Meteor.userId());
        state.humanFirst = coinFlip(); //Human always _chooses_ heads

        console.log('Creating new game from uploaded deck.');
        console.log('playerdeckid: '+playerDeckId);
        console.log('aiDeckId: '+aiDeckId);

        let playerDeck: Deck = Decks.find({"_id":playerDeckId}).fetch()[0];
        let aiDeck: Deck = Decks.find({"_id":aiDeckId}).fetch()[0];
        state.player.deck = generateDeck(playerDeck.deckcards, shuffle);
        state.ai.deck = generateDeck(aiDeck.deckcards, shuffle);

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

    export function resetRoundParams() {
        let state = GameStates.find({userid: Meteor.userId()}).fetch()[0];
        if(!state.isFirstRound){
            state.isSecondRound=false;
        }
        state.isFirstRound=false;
        state.energyPlayed=false;
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
    export function evolve(humanPlayer: boolean, toEvolve: PlayableCard, evolution: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if (isPokemon(toEvolve) && isPokemon(evolution)) {
            toEvolve = mapCardCopy(player, toEvolve);
            evolution = mapCardCopy(player, evolution);
            if (player.hand.includes(evolution) && (player.bench.includes(toEvolve) ||
                player.active === toEvolve)) {
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
            energy = mapCardCopy(player, energy);
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
        console.log("placing to active called");
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        card = mapCardCopy(player, card);
        if (!player.active && isPokemon(card)) {
            //Only possible if there is no active Pokemon and the card is a Pokemon type
            player.active = card;
            console.log("placing to active");
            
            removeFromHand(player, card);
            removeFromBench(player, player.active);
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
        let pokemonCard = mapCardCopy(player, card);
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
     * @returns {PlayableCard}
     */
    function mapCardCopy(player: Player, card: PlayableCard) {
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

    function applyDamage(target: PlayableCard, opponent: Player, damage: number,player: Player) {
        if(!target){
            return false;
        }
        if(!target.card){
            return false;
        }
        target.currentDamage += damage;

        if(target.currentDamage >= target.card.healthPoints){
            discard(opponent, target);
            collectPrizeCard(player)
        }
        return true;
    }

    /***
     * Logic for correctly discarding a card as well as all the attached evolution and/or energy cards
     * @param {Player} player -- Player who owns card to be discarded
     * @param {PlayableCard} card -- MUST CALL MapCardCopy before invoking this method.
     */
    function discard(player: Player, card: PlayableCard){
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        //Making an array of cards to discard based on number of energy cards and evolutions on card
        let toDiscard: PlayableCard[] = [];
        switch (card.card.type) {
            case CardType.POKEMON:
                toDiscard.push(card);
                //Playable cards need (unique) IDs and since we get rid of the IDs these cards previously had, we
                //are making them new ones with this counter
                let discardIDCounter: number = card.id * 10;
                for(let energy of card.currentEnergy){
                    toDiscard.push(new PlayableCard(discardIDCounter++, energy))
                }
                if(card.card.evolution !== ""){
                    //TODO: Find the evolution card(s) in the DB and add them to the toDiscard array
                }
                if(card === player.active){
                    toDiscard.push(new PlayableCard(discardIDCounter++,player.active.card))
                    player.active = undefined;
                }
                else if(player.bench.find(function (element) { return element.id === card.id })){
                    removeFromBench(player, card);
                }
                break;
            case CardType.TRAINER:
                toDiscard.push(card);
                removeFromHand(player, card);
                break;
            default:
                console.log("Invalid card");
                return;
        }
        player.discard=player.discard.concat(toDiscard);
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function executeAbility(humanPlayer: boolean, source: PlayableCard, abilityIndex: number, selectedTarget?: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        let opponent: Player = humanPlayer ? state.ai : state.player;
        
        source = mapCardCopy(player, source);
        
        const ability: AbilityReference = source.card.abilities.find((ability) => ability.index === abilityIndex);
        if (!ability) {
            console.log("ability not found on card");
            return;
        }
        let didPokemonAttack=false;
        switch (source.card.type) {
            case CardType.POKEMON:
                if (checkCost(ability.cost, source.currentEnergy as EnergyCard[])) {
                    didPokemonAttack = castAbility(ability, player, opponent, selectedTarget);
                }
                break;
            case CardType.TRAINER:
                castAbility(ability, player, opponent, selectedTarget);
                discard(player, source);
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
        const AvailableEnergy = cardEnergy.reduce<Cost>((acc, element) => {
            if (acc[element.category]) {
                acc.colorless += 1;
                acc[element.category] += 1
            } else {
                acc.colorless = acc.colorless ? acc.colorless + 1 : 1;
                acc[element.category] = 1;
            }

            return acc;
        }, {});

        return Object.keys(abilityCost).reduce<boolean>((isCastable, index) => {
            if (isCastable && abilityCost[index] > (AvailableEnergy[index] ? AvailableEnergy[index] : 0)) {
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
                    appliedDamage = applyDamage(target, opponent, ability.amount,player);
                    break;
                default:
                    console.log(`${ability.type} is not implemented yet`)
                    appliedDamage = false;
            }
        });
        return appliedDamage
    }

    function collectPrizeCard(player:Player){
        player.hand.push(player.prize.pop());
        if(player.prize.length){
            //TODO:WIN
        }
        
    }
}