import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat, EnergyCat , Decks } from "./collections";
import { GameStates } from "./collections";
import { GameManager } from "../gameLogic/GameManager";
import { GameState } from "../gameLogic/GameState";
import { PlayableCard } from "../gameLogic/PlayableCard";
import { parseAbilityString, parseCardString, parseDeckFile } from "../util/fileParsers";
import {AI} from "../AI/AI";

Meteor.methods({
    printToServerConsole() {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    },
    winGame:function () {
        let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
        GameManager.draw(false, gs.ai.deck.length, gs);
    },
    loseGame:function() {
        let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
        GameManager.draw(true, gs.player.deck.length, gs);
    },
    upsertNewGameState:function(){
        if(Meteor.isServer){
            GameStates.update({userid:Meteor.userId()},new GameState(Meteor.userId()),{upsert:true});
        }
    },
    newGameStart:function(shuffle: boolean, playerDeckId?:string, aiDeckId?:string){
        if(Meteor.isServer){
            GameManager.initializeGame(shuffle,playerDeckId,aiDeckId);
        }
    },
    createNewStateIfNotExisting:function(){
        if(Meteor.isServer){
            let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            if(!gs){
                GameStates.update({userid:Meteor.userId()},new GameState(Meteor.userId()),{upsert:true});
            }
        }
    },
    drawCard:function(humanPlayer:boolean, n?:number){
        if(Meteor.isServer){
            if(n){
                GameManager.draw(humanPlayer, n);
            }
            else{
                GameManager.draw(humanPlayer);
            }
        }
    },
    executeAbility:function(humanPlayer: boolean, source: PlayableCard, abilityIndex: number, target?: PlayableCard) {
        if(Meteor.isServer){
            GameManager.executeAbility(humanPlayer, source, abilityIndex, target);
        }
    },
    addEnergy:function(humanPlayer: boolean, pokemonPlayableCard:PlayableCard, energyPlayableCard:PlayableCard){
        if(Meteor.isServer){
            GameManager.addEnergy(humanPlayer, pokemonPlayableCard, energyPlayableCard);
        }
    },
    evolvePokemon:function(humanPlayer: boolean, evolution: PlayableCard, toEvolve: PlayableCard){
        if(Meteor.isServer){
            console.log("evolve: "+ evolution.card.name+" to "+ toEvolve.card.name)
            GameManager.evolve(humanPlayer, toEvolve, evolution);
        }
    },
    benchPokemon:function(humanPlayer: boolean, pokemonPlayableCard:PlayableCard){
        if(Meteor.isServer){
            GameManager.placeBench(humanPlayer, pokemonPlayableCard);
        }
    },
    placeActive:function(humanPlayer: boolean, pokemonPlayableCard: PlayableCard){
        if(Meteor.isServer) {
            GameManager.placeActive(humanPlayer, pokemonPlayableCard);
        }
    },
    endTurn:function(){
        if(Meteor.isServer){
            AI.playTurn();
            let state: GameState = GameManager.getState();
            if(!(state.isFirstRound||state.isSecondRound)){
                GameManager.draw(true,1);
            }
            GameManager.resetRoundParams();
            GameManager.applyActiveStatuses();
        }
    },
    dropDecksForUser:function(){
        if(Meteor.isServer){
            Decks.remove({userid:Meteor.userId()});
        }
    },
    deleteGameState:function(){
        if(Meteor.isServer){
            GameStates.remove({userid:Meteor.userId()});
        }
    },
    deleteAccount:function(){
        if (!Meteor.isServer) return;
    
        try {
          Meteor.users.remove(this.userId);
        } catch (e) {
    
          throw new Meteor.Error('self-delete', 'Failed to remove yourself');
        }
      },
    retreatPokemon:function(humanPlayer: boolean, pokemonPlayableCard: PlayableCard){
        GameManager.retreatPokemon(humanPlayer,pokemonPlayableCard);
    },
    uploadCards(data: { fileString: string }) {
        if (Meteor.isServer) {
            parseCardString(data.fileString);
        }
    },
    uploadAbilities(data: { fileString: string }) {
        if (Meteor.isServer) {
            parseAbilityString(data.fileString);
        }
    },
    uploadDeck(data: { fileString: string, name:string }) {
        if (Meteor.isServer) {
            parseDeckFile(data.fileString, data.name);
        }
    },
    dealAdditionalCards:function() {
        return GameManager.dealAdditionalCards();
    },
    mulliganToHandle:function() {
        return GameManager.mulliganToHandle();
    },
    reduceHandMulligan:function() {
        return GameManager.reduceHandMulligan();
    },
    appendCombatLog(log:string){
            if(Meteor.isServer){
                GameManager.appendCombatLog(log);
            }
    }
    });