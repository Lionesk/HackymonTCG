import { Player } from "./Player";
import { PlayableCard, CardPosition } from "./PlayableCard";
import { Cards, CardType, Decks, EnergyCard, GameStates, AbilityType } from "../api/collections";
import { Deck } from "../api/collections/Deck";
import { GameState } from "./GameState";
import { AbilityAction, Abilities } from "../api/collections/abilities";
import { Cost, AbilityReference, EnergyCat } from "../api/collections/Cards";

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
            // player.inPlay[player.deckIndex++].position = CardPosition.PRIZE;
        }
    }

    export function initializeGame(shuffle: boolean, playerDeckId?: string, aiDeckId?: string) {
        if (playerDeckId && aiDeckId) {
            GameStates.update({ userid: Meteor.userId() }, new GameState(Meteor.userId()), { upsert: true });
        }

        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        if (state.playing) {
            return
        }

        state = new GameState(Meteor.userId());
        state.humanFirst = coinFlip(); //Human always _chooses_ heads

        console.log('Creating new game from uploaded deck.');
        console.log('playerdeckid: ' + playerDeckId);
        console.log('aiDeckId: ' + aiDeckId);

        let playerDeck: Deck = Decks.find({ "_id": playerDeckId }).fetch()[0];
        let aiDeck: Deck = Decks.find({ "_id": aiDeckId }).fetch()[0];
        state.player.deck = generateDeck(playerDeck.deckcards, shuffle);
        state.player.inPlay = state.player.deck.slice(); // copy actual deck
        state.ai.deck = generateDeck(aiDeck.deckcards, shuffle);
        state.ai.inPlay = state.ai.deck.slice(); // copy actual deck

        GameStates.update({ userid: Meteor.userId() }, state);

        //Mulligan logic starts here

        //if a deck contains no pokemon game should not start
        // TODO: in frontend player has to stay at initial screen 
        if (noPokemonInDeck(state.player) || noPokemonInDeck(state.ai)) {
            console.log("You must have at least 1 pokemon in a deck to play!");
            if (Meteor.isClient)
            console.log('You must have at least 1 pokemon in a deck to play!');
            return;
        };

        console.log('AI drawing cards.');
        drawPlayer(state.ai, 7);

        console.log('Player drawing cards.');
        drawPlayer(state.player, 7);

        GameStates.update({ userid: Meteor.userId() }, state);

        //mulligan variables
        let human = state.player;
        let ai = state.ai;
        let humanHandLength = human.hand.length;
        let aiHandLength = ai.hand.length;
        let humanMulliganCounter = 0;
        let aiMulliganCounter = 0;
        let humanMulligan = (mulligan(humanHandLength, human, "human"));
        let aiMulligan = (mulligan(aiHandLength, ai, "ai"));

        while (!(!humanMulligan && !aiMulligan)) {
            //case 1:both have mulligans
            if (humanMulligan && aiMulligan) {
                console.log("Both players have mulliguns.");
                resolveMulligan(human, "human");
                resolveMulligan(ai, "ai");
            }
            //case 2: only human has mulligan
            else if (humanMulligan && !aiMulligan) {
                
                state.humanMulliganCount++;
                console.log("Human mulliganCount: " + state.humanMulliganCount);
                humanMulliganCounter++;
                resolveMulligan(human, "human");
            }
            //case 3: only ai has mulligan
            else {
                state.aiMulliganCount++;
                console.log("Ai mulliganCount: " + state.aiMulliganCount);
                aiMulliganCounter++;
                resolveMulligan(ai, "ai");
            };
            GameStates.update({ userid: Meteor.userId() }, state);
            humanMulligan = (mulligan(humanHandLength, human, "human"));
            aiMulligan = (mulligan(aiHandLength, ai, "ai"));
        }//end of while loop 

        //addCardsAfterMulligan(humanMulliganCounter, aiMulliganCounter);
       
        //end of mulligan logic
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
        let newDeck: PlayableCard[] = deck.map(((index: number) => new PlayableCard(counter++, Cards.find({ index }).fetch()[0])));
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

    export function resetRoundParams() {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        if (!state.isFirstRound) {
            state.isSecondRound = false;
        }
        state.isFirstRound = false;
        state.energyPlayed = false;
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    /***
     * Overloaded Draw function for internal GameManager calls where game state is already loaded.
     * 
     * TODO move to player
     * 
     * @param {Player} player
     * @param {number} n
     */
    export function drawPlayer(player: Player, n: number = 1) {
        for (let i = 0; i < n; i++) {
            if (player.deck.length === 0) {
                //TODO: End the game here (LOSS)
            }
            // player.inPlay[player.deckIndex++].position = CardPosition.HAND;
            player.hand.push(player.deck.pop() as PlayableCard);
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

    export function addEnergy(humanPlayer: boolean, pokemon: PlayableCard, energy: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        if (humanPlayer && state.energyPlayed) {
            return;
        }
        let player: Player = humanPlayer ? state.player : state.ai;
        if (isPokemon(pokemon) && isEnergy(energy)) {
            pokemon = mapCardCopy(player, pokemon);
            energy = mapCardCopy(player, energy);
            //Pokemon must either be active or on the bench
            addEnergyToCard(pokemon, energy);
            removeFromHand(player, energy);
            if (humanPlayer) {
                state.energyPlayed = true;
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
            console.log("placing to active")
            // card.position = CardPosition.ACTIVE;
            removeFromHand(player, card);
            removeFromBench(player, player.active);
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function placeBench(humanPlayer: boolean, card: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if (!player.active) {
            placeActive(true, card);
            return;
        }
        let pokemonCard = mapCardCopy(player, card);
        if (player.bench.length < 5 && isPokemon(pokemonCard)) {
            //Only possible if player has less than 5 Pokemon on the bench
            // card.position = CardPosition.BENCH;
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
    function removeFromBench(player: Player, card: PlayableCard) {
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
    function mapCardCopy(player: Player, card: PlayableCard, hand?: boolean) {
        let playableCard: PlayableCard | undefined;
        if (player.active && player.active.id === card.id) {
            return player.active;
        }
        playableCard = player.hand.find(function (element) {
            return element.id === card.id
        });
        if (playableCard !== undefined) {
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
        if (playableCard.card !== undefined) {
            return playableCard.card.type === CardType.POKEMON;
        }
    }

    function isEnergy(playableCard: PlayableCard) {
        return playableCard.card.type === CardType.ENERGY;
    }

    export function addEnergyToCard(pokemonCard: PlayableCard, energyCard: PlayableCard) {
        console.log('Adding ' + energyCard.card.name + ' energy to ' + pokemonCard.card.name);
        pokemonCard.currentEnergy.push(energyCard.card);
    }

    function cleanHand(hand: PlayableCard[]) {
        return hand.filter(playableCard => !!playableCard);
    }

    export function applyDamage(target: PlayableCard, opponent: Player, damage: number, player: Player) {
        if(!target || !target.card || !target.card.healthPoints){
            return false;
        }

        target.currentDamage += damage;

        if (target.currentDamage >= target.card.healthPoints) {
            discard(opponent, target);
            collectPrizeCard(player);
            // target.position = CardPosition.DISCARD;
        }
        return true;
    }

    /***
     * Logic for correctly discarding a card as well as all the attached evolution and/or energy cards
     * @param {Player} player -- Player who owns card to be discarded
     * @param {PlayableCard} card -- MUST CALL MapCardCopy before invoking this method.
     */
    function discard(player: Player, card: PlayableCard) {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        //Making an array of cards to discard based on number of energy cards and evolutions on card
        let toDiscard: PlayableCard[] = [];
        switch (card.card.type) {
            case CardType.POKEMON:
                toDiscard.push(card);
                //Playable cards need (unique) IDs and since we get rid of the IDs these cards previously had, we
                //are making them new ones with this counter
                let discardIDCounter: number = card.id * 10;
                for (let energy of card.currentEnergy) {
                    toDiscard.push(new PlayableCard(discardIDCounter++, energy))
                }
                if (card.card.evolution !== "") {
                    //TODO: Find the evolution card(s) in the DB and add them to the toDiscard array
                }
                if (card === player.active) {
                    toDiscard.push(new PlayableCard(discardIDCounter++, player.active.card))
                    player.active = undefined;
                }
                else if (player.bench.find(function (element) { return element.id === card.id })) {
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
        player.discard = player.discard.concat(toDiscard);
        GameStates.update({ userid: Meteor.userId() }, state);
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
        let didPokemonAttack = false;
        switch (source.card.type) {
            case CardType.POKEMON:
                if (ability.cost && checkCost(ability.cost, source.currentEnergy as EnergyCard[])) {
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

        if (didPokemonAttack && humanPlayer) {
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
    function removeCost(retreatCost: Cost, cardEnergy: EnergyCard[]){
        let costEnergy: EnergyCat[] = [];
        let colorlessCount=0;
        Object.keys(retreatCost).forEach((costKey: EnergyCat) => {
            for(let i =0; i<(retreatCost[costKey] as number);i++){
                costEnergy.push(costKey);
                if(costKey=== EnergyCat.COLORLESS){
                    colorlessCount++;
                }else{
                    costEnergy.push(costKey);
                }
            }
         });
         console.log(cardEnergy);
         costEnergy.forEach((costE)=>{
            cardEnergy.forEach((cardE,index)=>{
                if(cardE.category===costE){
                    this.splice(index,1);
                }
            })
         })
         console.log(cardEnergy);
         for(let i= 0; i<colorlessCount;i++){
            cardEnergy.splice(0,1);
         }
         console.log(cardEnergy);
         return cardEnergy;
    }
    function castAbility(abilRef: AbilityReference, player: Player, opponent: Player, selectedTarget?: PlayableCard): boolean {
        let target: PlayableCard;
        if (selectedTarget) {
            target = selectedTarget;
        } else {
            target = opponent.active as PlayableCard; // if this is undefined the game should be over
        }
        let appliedDamage = false;
        Abilities.find({ index: abilRef.index }).fetch()[0].actions.forEach((ability: AbilityAction) => {
            switch (ability.type) {
                case AbilityType.DAMAGE:
                    // console.log("t"+parseInt(ability.amount));
                    if (ability.amount) {
                        appliedDamage = applyDamage(target, opponent, ability.amount, player);
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
    export function retreatPokemon(humanPlayer: boolean, pokemonPlayableCard: PlayableCard){
        console.log("RETREAT");
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let player: Player = humanPlayer ? state.player : state.ai;
        if (!player.active || !player.active.card.retreatCost) {
            throw new Error("no active to retreat");
        }
        if (checkCost(player.active.card.retreatCost, player.active.currentEnergy as EnergyCard[])) {
            player.active.currentEnergy = removeCost(player.active.card.retreatCost,player.active.currentEnergy  as EnergyCard[]);
            let active = new PlayableCard(player.active.id, player.active.card);
            active.currentEnergy =player.active.currentEnergy;
            player.bench.push(active);
            player.active=undefined;
            GameStates.update({userid: Meteor.userId()}, state); 
            placeActive(humanPlayer,pokemonPlayableCard);
        }
    }
    function collectPrizeCard(player:Player){
        player.hand.push(player.prize.pop() as PlayableCard);
        if (player.prize.length) {
            //TODO:WIN
        }

    }

    export function returnHandToDeck(player: Player) {
        for (let i = 0; i < 7; i++) {
            let card = player.hand.pop();

            if (card !== undefined)
                player.deck.push(card);
        }

        if (player.hand.length !== 0) {
            console.log("There is a problem with returnHandToDeck method," +
                " hand must be 0");
        }
    }

    export function resolveMulligan(player: Player, name: string) {
        console.log(name + " has a mulligan");
        returnHandToDeck(player);
        console.log("Mulligan happened");
        player.deck = shuffleDeck(player.deck);

        console.log(name + ' drawing cards.');
        drawPlayer(player, 7);
    }
    //mulligan logic functions from here
    export function dealAdditionalCards() {
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let humanCounter = state.humanMulliganCount;
        let aiCounter = state.aiMulliganCount;

        console.log("HumanMuligan Count " + humanCounter);
        console.log("Ai Count " + aiCounter);
        //no additional cards to draw
        if (humanCounter === aiCounter) {
            return null;
        }
        let extraCardNum = 0;

        if (humanCounter < aiCounter) {
            extraCardNum = aiCounter - humanCounter;
            let msg = "Human draws " + extraCardNum + " additional cards" +
            "due to ai mulligans";
            console.log(msg);
            drawPlayer(state.player, extraCardNum);
            GameStates.update({ userid: Meteor.userId() }, state);
            console.log("Human hand " + state.player.hand);
            return msg;

        }

        else {
            extraCardNum = humanCounter -aiCounter;
           let msg = "Ai draws " + extraCardNum + " additional cards" +
           "due to human mulligans";
            console.log(msg);
            drawPlayer(state.ai, extraCardNum);
            GameStates.update({ userid: Meteor.userId() }, state);
            console.log("AI hand " + state.ai.hand);
            return msg;
        }
        
    }

    export function mulliganToHandle(){
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let humanCounter = state.humanMulliganCount;
        let aiCounter = state.aiMulliganCount;
        let resultArr = [false, false];

        console.log("HumanMuligan Count " + humanCounter);
        console.log("Ai Count " + aiCounter);
        //no additional cards to draw
        if (humanCounter === aiCounter) {
            return resultArr;
        }
       if (humanCounter < aiCounter) {
           console.log("sending from if");
            return [true,true];
        }
        else {
            console.log("sending from else");
            return [true, false];
        }
    }



    export function noPokemonInDeck(state: Player) {
        let noPokemonInDeck = true;
        for (let i = 0; i < state.deck.length; i++) {
            if (isPokemon(state.deck[i])) {
                if(state.deck[i].card && state.deck[i].card.evolution){
                    continue;
                }
                 else{
                    noPokemonInDeck = false;
                    break;
                 }   
                
            }
        }

        return noPokemonInDeck;
    }

   export function mulligan(numOfCards: number, state: Player, type?: string) {
        let noPokemon = true;
        for (let i = 0; i < numOfCards; i++) {
            
            if ( state.hand[i] && isPokemon(state.hand[i])) {
                
                if(state.hand[i].card && state.hand[i].card.evolution){
                    continue;
                }
                 else{
                    noPokemon = false;
                    break;
                 } 
               
            }
        }
        if (noPokemon) {
            //console.log("Mulligun for " + type);
        }
        return (noPokemon);
    }

    export function reduceHandMulligan(){
        let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        let humanCounter = state.humanMulliganCount;
        let aiCounter = state.aiMulliganCount;

        let extraCardNum = 0;

        if (humanCounter < aiCounter) {
            extraCardNum = aiCounter - humanCounter;
            for(let i=0; i<extraCardNum; i++){
                state.ai.deck.pop();
            }
            GameStates.update({ userid: Meteor.userId() }, state);
            let msg = "Ai's deck is reduced by " + extraCardNum + " cards " +
            "due to mulligan(s)";
            console.log(msg);
            console.log("Ai deck " + state.ai.deck);
            return msg;

        }

        else {
        extraCardNum = humanCounter -aiCounter;
           let msg = "Human's deck is reduced by " + extraCardNum + " cards " +
           "due to mulligan(s)"
           for(let i=0; i<extraCardNum; i++){
            state.player.deck.pop();
        }
        GameStates.update({ userid: Meteor.userId() }, state);
            console.log(msg);
            console.log("Human deck " + state.player.deck);
            //drawPlayer(state.ai, extraCardNum);
            return msg;
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    
    //end of mulligan logic functions

}