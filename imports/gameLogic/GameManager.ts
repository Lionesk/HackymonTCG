import { Player } from "./Player";
import { PlayableCard } from "./PlayableCard";
import { Cards, CardType, Decks, EnergyCard, GameStates, AbilityType } from "../api/collections";
import { Deck } from "../api/collections/Deck";
import { GameState } from "./GameState";
import { AbilityAction, Abilities, Status } from "../api/collections/abilities";
import { Cost, AbilityReference, EnergyCat, TrainerCard, PokemonCard, Card } from "../api/collections/Cards";
import { createAbility } from "./abilities/AbilityFactory";

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
            GameStates.update({userid:Meteor.userId()}, new GameState(Meteor.userId()),{upsert:true});
        }

        let state = getState();
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
        state.ai.deck = generateDeck(aiDeck.deckcards, shuffle);
        if (shuffle) {
            console.log("SHUFFLING " + shuffle);
            state.player.shuffle();
            state.ai.shuffle();
        }

        updateGameState(state);

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
        draw(false, 7, state);

        console.log('Player drawing cards.');
        draw(true, 7, state);

        updateGameState(state);

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
                state.combatLog.push("You and the AI got a mulligan");
            }
            //case 2: only human has mulligan
            else if (humanMulligan && !aiMulligan) {
                
                state.humanMulliganCount++;
                console.log("Human mulliganCount: " + state.humanMulliganCount);
                humanMulliganCounter++;
                resolveMulligan(human, "human");
                state.combatLog.push("You got a mulligan");
            }
            //case 3: only ai has mulligan
            else {
                state.aiMulliganCount++;
                console.log("Ai mulliganCount: " + state.aiMulliganCount);
                aiMulliganCounter++;
                resolveMulligan(ai, "ai");
                state.combatLog.push("AI got a mulligan");
            }
            updateGameState(state);
            humanMulligan = (mulligan(humanHandLength, human, "human"));
            aiMulligan = (mulligan(aiHandLength, ai, "ai"));
        }//end of while loop 

        //addCardsAfterMulligan(humanMulliganCounter, aiMulliganCounter);
       
        //end of mulligan logic
        updateGameState(state);

        console.log('Placing prize cards');
        placePrizeCards(state.player);
        placePrizeCards(state.ai);

        console.log('Game initialization done, updating the DB.');
        updateGameState(state);
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
        return newDeck;
    }

    export function draw(humanPlayer: boolean, n: number = 1, gs?: GameState) {
        let state: GameState = gs || getState();
        let player: Player = humanPlayer ? state.player : state.ai;
        player.draw(n);
        if(!(state.isFirstRound||state.isSecondRound)){
            if (humanPlayer) {
                for(let i=n;i>0;i--){
                    state.combatLog.push("You've drawn " + player.hand[player.hand.length - i].card.name);
                }
            } else {
                state.combatLog.push("AI have "+n+" drawn a card(s)");
            }
        }
        updateGameState(state);
    }

    export function drawPlayer(player: Player, n: number = 1) {
        console.log("Trying to draw " + n + " cards from a deck with " + player.deck.length + " cards remaining");
        if(player.deck.length <= n){
            console.log("Player " + player.id + " is drawing their last card!");
            setLoser(player);
        }
        for (let i = 0; i < n; i++) {
            player.hand.push(player.deck.pop() as PlayableCard);
        }
    }

    export function setWinner(winner: Player, gs?: GameState) {
        let state: GameState = gs === undefined ? getState() : gs;
        console.log(winner.id === state.player.id ? "Player has won": "AI has won");
        state.winner = state.winner || winner; // don't override winner if somehow multiple win conditions trigger in bizarre orders
        updateGameState(state);
    }

    export function setLoser(loser: Player, gs?: GameState) {
        let state: GameState = gs === undefined ? getState() : gs;
        console.log(loser.id === state.player.id ? "AI has won" : "Player has won");
        state.winner = loser.id === state.player.id ? state.ai : state.player;
        updateGameState(state);
    }

    export function resetRoundParams() {
        let state: GameState;
        state = getState();
        if (!state.isFirstRound) {
            state.isSecondRound = false;
        }
        state.isFirstRound = false;
        state.energyPlayed = false;
        if(!state.isFirstRound && state.isSecondRound){
            state.combatLog.push("Select your bench pokemon")
        }
        updateGameState(state);
    }

    export function evolve(humanPlayer: boolean, toEvolve: PlayableCard<PokemonCard>, evolution: PlayableCard<PokemonCard>) {
        let state = getState();
        let player: Player = humanPlayer ? state.player : state.ai;
        if (toEvolve.card.type !== CardType.POKEMON || evolution.card.type !== CardType.POKEMON) {
            throw new Error("Invalid cards for evolution")
        }
        
        if (isPokemon(toEvolve) && isPokemon(evolution)) {
            toEvolve = mapCardCopy(player, toEvolve) as PlayableCard<PokemonCard>;
            evolution = mapCardCopy(player, evolution) as PlayableCard<PokemonCard>;
            // TODO find way to discard card prior to evolution
            if (player.hand.includes(evolution) && (player.bench.includes(toEvolve) || player.active === toEvolve)) {
                toEvolve.evolve(evolution);
                removeFromHand(player, evolution);
                if (humanPlayer) {
                    state.combatLog.push("You evolved " + toEvolve.card.name + " to " + evolution.card.name);
                } else {
                    state.combatLog.push("AI evolved " + toEvolve.card.name + " to " + evolution.card.name);
                }

            }
        }
        updateGameState(state);
    }

    export function addEnergy(humanPlayer: boolean, pokemon: PlayableCard<PokemonCard>, energy: PlayableCard<EnergyCard>) {
        let state = getState();
        if (pokemon.card.type !== CardType.POKEMON || energy.card.type != CardType.ENERGY) {
            throw new Error("invalid cards for apply energy");
        }
        
        if (humanPlayer && state.energyPlayed) {
            return;
        }
        let player: Player = humanPlayer ? state.player : state.ai;
        if (isPokemon(pokemon) && isEnergy(energy)) {
            pokemon = mapCardCopy(player, pokemon) as PlayableCard<PokemonCard>;
            energy = mapCardCopy(player, energy) as PlayableCard<EnergyCard>;
            //Pokemon must either be active or on the bench
            pokemon.addEnergy(energy);
            removeFromHand(player, energy);
            if (humanPlayer) {
                state.energyPlayed = true;
            }
            
            state.combatLog.push(`${humanPlayer ? 'You' : 'AI'} added ${energy.card.name} energy to ${pokemon.card.name}`);
            
            updateGameState(state);
        }
    }

    export function placeActive(humanPlayer: boolean, card: PlayableCard<PokemonCard>) {
        if (card.card.type !== CardType.POKEMON) {
            throw new Error("Invalid card type for place active")
        }
        
        let state = getState();
        let player: Player = humanPlayer ? state.player : state.ai;
        card = mapCardCopy(player, card) as PlayableCard<PokemonCard>;
        if (!player.active && isPokemon(card)) {
            //Only possible if there is no active Pokemon and the card is a Pokemon type
            player.active = card;
            // card.position = CardPosition.ACTIVE;
            removeFromHand(player, card);
            removeFromBench(player, player.active);
            if(humanPlayer){
                state.combatLog.push("You placed "+card.card.name+ " as your active");
            }else{
                state.combatLog.push("AI placed "+card.card.name+ " as its active");
            }
        }
        updateGameState(state);
    }

    export function placeBench(humanPlayer: boolean, card: PlayableCard<PokemonCard>) {
        if (card.card.type !== CardType.POKEMON) {
            throw new Error("Invlid card type for benching");
        }
        
        let state = getState();
        let player: Player = humanPlayer ? state.player : state.ai;
        if (!player.active) {
            placeActive(true, card);
            return;
        }
        let pokemonCard = mapCardCopy(player, card) as PlayableCard<PokemonCard>;
        if (player.bench.length < 5 && isPokemon(pokemonCard)) {
            //Only possible if player has less than 5 Pokemon on the bench
            // card.position = CardPosition.BENCH;
            player.bench.push(pokemonCard);
            removeFromHand(player, pokemonCard);
            if(humanPlayer){
                state.combatLog.push("You benched "+pokemonCard.card.name);
            }else{
                state.combatLog.push("AI benched "+pokemonCard.card.name);
            } 
        }
        updateGameState(state);
    }

    /***
     * Helper function for removing a card from a players hand, using the Array filter method.
     * @param {Player} player
     * @param {PlayableCard} card
     */
    function removeFromHand(player: Player, card: PlayableCard) {
        player.hand = player.hand.filter(c => c !== card);
        player.hand = cleanHand(player.hand); // not needed?
    }

    function removeFromBench(player: Player, card: PlayableCard) {
        player.bench = player.bench.filter(c => c !== card);
    }

    export function playTrainer() {
        //TODO: Implement simple (non-exceptional) trainer cards should work throygh ability api
    }

    /***
     * The Card objects passed by the client side code are merely copies, and so in order to accurately affect the game
     * state we need to map them to objects in the GameState object in memory using their IDs
     * @param {Player} player
     * @param {PlayableCard} card
     * @returns {PlayableCard}
     */
    function mapCardCopy(player: Player, card: PlayableCard, hand?: boolean): PlayableCard {
        let playableCard: PlayableCard | undefined;
        if (player.active && player.active.id === card.id) {
            if (card.card.type != CardType.POKEMON) {
                throw new Error("attempting to fetch active from non pokemon");
            }
            return player.active;
        }
        playableCard = player.hand.find((element: PlayableCard) => {
            return element.id === card.id
        });
        if (playableCard !== undefined) {
            return playableCard;
        }
        playableCard = player.bench.find((element) => {
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

    export function addEnergyToCard(pokemonCard: PlayableCard, energyCard: PlayableCard<EnergyCard>) {
        console.log('Adding ' + energyCard.card.name + ' energy to ' + pokemonCard.card.name);
        pokemonCard.currentEnergy.push(energyCard);
    }

    function cleanHand(hand: PlayableCard[]) {
        return hand.filter(playableCard => !!playableCard);
    }

    export function applyDamage(target: PlayableCard, opponent: Player, damage: number, player: Player) {
        if (!target || !target.card || !target.card.healthPoints) {
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
    function discard(player: Player, card: PlayableCard, preserveCard?:boolean) {
        let state = getState();
        player.discard(card);        
        updateGameState(state);
    }

    function checkForDeath(state: GameState) {
        const playerDiscardCount = state.player.discardDead();
        const aiDiscardCount = state.ai.discardDead();
        state.player.collectPrizeCard(aiDiscardCount);
        state.ai.collectPrizeCard(playerDiscardCount);
    }

    export function checkForOutOfCards(state: GameState) {
        if (state.ai.cantDraw()) {
            setWinner(state.player, state);
        } else if (state.player.cantDraw()) {
            setWinner(state.ai, state);
        }
    }
    
    function checkForWinner(state: GameState) {
        if (state.player.outOfPrize() || state.ai.noPokemon()) {
            setWinner(state.player, state);
        } else if (state.ai.outOfPrize() || state.player.noPokemon()) {            console.log("WINNER WINNER CHICKEN DINNER: ", state.ai.outOfPrize, state.player.noPokemon)
            setWinner(state.ai, state);
        }
    }
    
    function updateGameState(state: GameState) {
        if (!state.isFirstRound && !state.isSecondRound && !state.winner) {
            checkForDeath(state);
            checkForWinner(state);
        }
        GameStates.update({ userid: Meteor.userId() }, state);
    }

    export function executeAbility(humanPlayer: boolean, source: PlayableCard, abilityIndex: number, selectedTarget?: PlayableCard) {
        let state = getState();
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
        let didPokemonAttack = true;
        switch (source.card.type) {
            case CardType.POKEMON:
                if (ability.cost && checkCost(ability.cost, source.currentEnergy as PlayableCard<EnergyCard>[])) {
                    try {
                        castAbility(state, ability, player, opponent, selectedTarget);
                    } catch (e) {
                        console.error(e.message);
                        didPokemonAttack = false;
                    }
                } else {
                    didPokemonAttack = false;
                }
                break;
            case CardType.TRAINER:
                castAbility(state, ability, player, opponent, selectedTarget);
                discard(player, source);
                break;
            default:
                console.log("Invalid card");
                return;

        }
        // update model
        updateGameState(state);

        if (didPokemonAttack && humanPlayer &&source.card.type!==CardType.TRAINER) {
            Meteor.call("endTurn");
        }
    }

    export function checkCost(abilityCost: Cost, cardEnergy: PlayableCard<EnergyCard>[]): boolean {
        const available: Cost = cardEnergy.reduce<Cost>((acc, element) => {
            acc.colorless = acc.colorless ? acc.colorless + 1 : 1;
            acc[element.card.category] = (acc[element.card.category] || 0) + 1;

            return acc;
        }, {});

        return Object.keys(abilityCost).reduce<boolean>((isCastable, index: keyof Cost) => {
            //  abilityCost[index] will always be defined
            if (isCastable && abilityCost[index] as number > (available[index] || 0)) {
                return false;
            }
            return isCastable;
        }, true);
    }

    function castAbility(state: GameState, abilRef: AbilityReference, player: Player, opponent: Player, selectedTarget?: PlayableCard) {
        Abilities.find({ index: abilRef.index }).fetch()[0].actions.forEach((ability: AbilityAction) => {
            try {
                const executableAbility = createAbility(ability, player, opponent);
                executableAbility.execute(selectedTarget);
                state.combatLog.push(executableAbility.toString()); // drop this into an action log
            } catch (e) {
                console.error(e.message);
            }
        });
    }

    export function removeCost(retreatCost: Cost, cardEnergy: PlayableCard<EnergyCard>[]) {
        let costEnergy: EnergyCat[] = [];
        let colorlessCount = 0;
        Object.keys(retreatCost).forEach((costKey: EnergyCat) => {
            for (let i = 0; i < (retreatCost[costKey] as number); i++) {
                costEnergy.push(costKey);
                if (costKey === EnergyCat.COLORLESS) {
                    colorlessCount++;
                } else {
                    costEnergy.push(costKey);
                }
            }
        });
        console.log(cardEnergy);
        costEnergy.forEach((costE) => {
            cardEnergy.forEach((cardE, index) => {
                if (cardE.card.category === costE) {
                    this.splice(index, 1);
                }
            })
        })
        console.log(cardEnergy);
        for (let i = 0; i < colorlessCount; i++) {
            cardEnergy.splice(0, 1);
        }
        console.log(cardEnergy);
        return cardEnergy;
    }

    export function retreatPokemon(humanPlayer: boolean, pokemonPlayableCard: PlayableCard<PokemonCard>) {
        console.log("RETREAT");
        let state = getState();
        let player: Player = humanPlayer ? state.player : state.ai;
        if (!player.active || !player.active.card.retreatCost) {
            throw new Error("no active to retreat");
        }
        if (checkCost(player.active.card.retreatCost, player.active.currentEnergy as PlayableCard<EnergyCard>[])) {
            player.active.currentEnergy = removeCost(player.active.card.retreatCost, player.active.currentEnergy as PlayableCard<EnergyCard>[]);
            let active = new PlayableCard(player.active.id, player.active.card);
            active.currentEnergy = player.active.currentEnergy;
            active.statuses=[];
            player.bench.push(active);
            player.active = undefined;
            updateGameState(state);
            placeActive(humanPlayer, pokemonPlayableCard);
        }
    }

    function collectPrizeCard(player: Player) {
        player.hand.push(player.prize.pop() as PlayableCard);
        if (player.prize.length === 0) {
            setWinner(player);
        }
    }

    export function getState(): GameState {
        const state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
        Object.setPrototypeOf(state.player, Player.prototype);
        Object.setPrototypeOf(state.ai, Player.prototype);
        if (state.ai.active) {
            Object.setPrototypeOf(state.ai.active, PlayableCard.prototype);
        }
        if (state.player.active) {
            Object.setPrototypeOf(state.player.active, PlayableCard.prototype);
        }
        state.ai.bench.forEach((card: PlayableCard) => {
            Object.setPrototypeOf(card, PlayableCard.prototype);
        });
        state.player.bench.forEach((card: PlayableCard) => {
            Object.setPrototypeOf(card, PlayableCard.prototype);
        });
        state.ai.hand.forEach((card: PlayableCard) => {
            Object.setPrototypeOf(card, PlayableCard.prototype);
        });
        state.player.hand.forEach((card: PlayableCard) => {
            Object.setPrototypeOf(card, PlayableCard.prototype);
        });
        state.ai.deck.forEach((card: PlayableCard) => {
            Object.setPrototypeOf(card, PlayableCard.prototype);
        });
        state.player.deck.forEach((card: PlayableCard) => {
            Object.setPrototypeOf(card, PlayableCard.prototype);
        });
        return state;
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
       
        player.shuffle()

        console.log(name + ' drawing cards.');
        drawPlayer(player, 7);
        console.log("Mulligan happened" + "Deck size" + player.deck.length);
    }
    //mulligan logic functions from here
    export function dealAdditionalCards() {
        let state = getState();
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
            updateGameState(state);
            console.log("Human hand " + state.player.hand);
            return msg;

        }
        else {
            extraCardNum = humanCounter -aiCounter;
           let msg = "Ai draws " + extraCardNum + " additional cards" +
           "due to human mulligans";
            console.log(msg);
            drawPlayer(state.ai, extraCardNum);
            updateGameState(state);
            console.log("AI hand " + state.ai.hand);
            return msg;
        }
        
    }

    export function mulliganToHandle(){
        let state = getState();
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
                if((state.deck[i].card && state.deck[i].card.evolution)){
                    continue;
                }
                noPokemonInDeck = false;
                break;
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
        let state =getState();
        let humanCounter = state.humanMulliganCount;
        let aiCounter = state.aiMulliganCount;

        let extraCardNum = 0;

        if (humanCounter < aiCounter) {
            extraCardNum = aiCounter - humanCounter;
            for(let i=0; i<extraCardNum; i++){
               // state.ai.deck.pop();
               let card = state.ai.hand.pop();

               if (card !== undefined)
               state.ai.deck.push(card);
                
            }
            updateGameState(state);
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
                let card = state.player.hand.pop();
                if (card !== undefined){
                state.player.deck.push(card);
                }
            }
            updateGameState(state);
            console.log(msg);
            console.log("Human deck " + state.player.deck);
            //drawPlayer(state.ai, extraCardNum);
            return msg;
        }
    }

    
    //end of mulligan logic functions
    export function applyActiveStatuses(beginningOfRound:boolean){
        let state = getState();
        console.log("STATUS")
        applyStatus(true,state.player, state.combatLog,beginningOfRound);
        applyStatus(false,state.ai, state.combatLog,beginningOfRound);
        updateGameState(state);
    }
    function applyStatus(humanPlayer:boolean, player:Player, combatLog:Array<string>,beginningOfRound:boolean){
        if(!player.active){
            return
        }
        player.active.statuses.forEach((stats)=>{
            switch(stats){
                case Status.SLEEP:
                    if(beginningOfRound){
                        return;
                    }
                    let coin= coinFlip();
                    if(coin){
                        if(!player.active){
                            return;
                        }
                        removeStatus(player.active, Status.SLEEP);
                        if(humanPlayer){
                            combatLog.push("You're "+ player.active.card.name+" woke up!");
                        }else{
                            combatLog.push("AI's "+ player.active.card.name+" woke up!");
                        }
                    }else{
                        if(!player.active){
                            return;
                        }
                        if(humanPlayer){
                            combatLog.push("You're "+ player.active.card.name+" is still asleep!");
                        }else{
                            combatLog.push("AI's "+ player.active.card.name+" is still asleep!");
                        }
                    }
                break;
                case Status.POISONED:
                    if(!beginningOfRound){
                        return;
                    }
                    if(!player.active){
                        return;
                    }
                    player.active.damage(10);
                    if(humanPlayer){
                        combatLog.push("You're "+ player.active.card.name+" took 10 poison damage!");
                    }else{
                        combatLog.push("AI's "+ player.active.card.name+" took 10 poison damage!");
                    }
                break;
                case Status.PARALYZED:
                    if(beginningOfRound){
                        return;
                    }
                    if(!player.active){
                        return;
                    }
                    removeStatus(player.active, Status.PARALYZED);
                    if(humanPlayer){
                        combatLog.push("You're "+ player.active.card.name+" is no longer paralyzed!");
                    }else{
                        combatLog.push("AI's "+ player.active.card.name+" is no longer paralyzed!");
                    }
                break;
                case Status.STUCK:
                if(beginningOfRound){
                    return;
                }
                if(!player.active){
                    return;
                }
                removeStatus(player.active, Status.STUCK);
                if(humanPlayer){
                    combatLog.push("You're "+ player.active.card.name+" is no longer stuck!");
                }else{
                    combatLog.push("AI's "+ player.active.card.name+" is no longer stuck!");
                }
            break;
            }
        })
    }
    function removeStatus( active:PlayableCard, status:Status){
        active.statuses = active.statuses.filter((stat)=>{return status!==stat})
    }

    export function appendCombatLog(log:string){
        let state = getState();
        state.combatLog.push(log);
        updateGameState(state);
    }

}