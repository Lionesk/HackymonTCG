import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat, EnergyCat } from "./collections";
import { GameStates, Card } from "./collections";
import { GameState } from "../gameLogic/GameState";
import { PlayableCard } from "../gameLogic/PlayableCard";
import { parseAbilityString, parseCardString } from "../util/fileParsers";

Meteor.methods({
    printToServerConsole() {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    },
    upsertNewGameState:function(){
        if(Meteor.isServer){
            GameStates.update({userid:Meteor.userId()},new GameState(Meteor.userId()),{upsert:true});
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
    addEnergy:function(pokemonPlayableCard:PlayableCard,energyPlayableCard:PlayableCard){
        if(Meteor.isServer){
            console.log("printing from addEnergy: "+pokemonPlayableCard.card.name+" , "+energyPlayableCard.card.name);
        }
    },
    evolvePokemon:function(pokemonPlayableCardEvolver:PlayableCard,pokemonPlayableCard:PlayableCard){
        if(Meteor.isServer){
            console.log("printing from evolving "+pokemonPlayableCard.card.name+" to: "+pokemonPlayableCardEvolver.card.name);
        }
    },
    benchPokemon:function(pokemonPlayableCard:PlayableCard){
        if(Meteor.isServer){
            console.log("printing from bench pokemon "+pokemonPlayableCard.card.name);
        }
    },
    testModifyGameState:function(){
        if(Meteor.isServer){
            //simulates a change done by the gamemanager
            let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            // let card = new Card();
            gs.ai.hand.push(new PlayableCard());
            gs.ai.hand.push(new PlayableCard());
            gs.ai.hand.push(new PlayableCard());
            gs.ai.bench[0] = (new PlayableCard());
            gs.ai.bench[1] = (new PlayableCard());
            gs.ai.bench[2] = (new PlayableCard());
            gs.ai.active = (new PlayableCard());
            gs.ai.hand[0].card = Cards.find().fetch()[0];
            gs.ai.hand[1].card = Cards.find().fetch()[0];
            gs.ai.hand[2].card = Cards.find().fetch()[0];
            gs.ai.bench[0].card = Cards.find().fetch()[0];
            gs.ai.bench[1].card = Cards.find().fetch()[0];
            gs.ai.bench[2].card = Cards.find().fetch()[0];
            gs.ai.active.card = Cards.find().fetch()[0];
            gs.ai.hand[0].card.name="handcardname";
            gs.ai.hand[2].card.name="handcardname";
            gs.ai.hand[1].card.name="handcardname";
            gs.ai.hand[0].card.type=CardType.ENERGY;
            gs.ai.hand[0].card.category=EnergyCat.LIGHTNING;
            gs.ai.hand[1].card.type=CardType.ENERGY;
            gs.ai.hand[2].card.type=CardType.ENERGY;
            gs.ai.bench[1].card.name="benchcardname";
            gs.ai.bench[2].card.name="benchcardname";
            gs.ai.bench[0].card.name="benchcardname";
            gs.ai.active.card.name="activecardname";
            
            gs.player.hand.push(new PlayableCard());
            gs.player.hand.push(new PlayableCard());
            gs.player.hand.push(new PlayableCard());
            gs.player.bench[0] = (new PlayableCard());
            gs.player.bench[1] = (new PlayableCard());
            gs.player.bench[2] = (new PlayableCard());
            gs.player.active = (new PlayableCard());
            gs.player.hand[0].card = Cards.find().fetch()[0];
            gs.player.hand[1].card = Cards.find().fetch()[0];
            gs.player.hand[2].card = Cards.find().fetch()[0];
            gs.player.bench[0].card = Cards.find().fetch()[0];
            gs.player.bench[1].card = Cards.find().fetch()[0];
            gs.player.bench[2].card = Cards.find().fetch()[0];
            gs.player.active.card = Cards.find().fetch()[0];
            gs.player.hand[0].card.name="evolvercardname1";
            gs.player.hand[2].card.name="handcardname3";
            gs.player.hand[1].card.name="handcardname2";
            gs.player.hand[0].card.type=CardType.POKEMON;
            gs.player.hand[0].card.evolution="evolveecardname1";
            gs.player.hand[1].card.type=CardType.ENERGY;
            gs.player.hand[2].card.type=CardType.ENERGY;
            gs.player.bench[1].card.category=PokemonCat.FIGHTING;
            gs.player.bench[1].card.type=CardType.POKEMON;
            gs.player.bench[0].card.category=PokemonCat.FIGHTING;
            gs.player.bench[0].card.type=CardType.POKEMON;
            gs.player.bench[2].card.category=PokemonCat.FIGHTING;
            gs.player.bench[2].card.type=CardType.POKEMON;
            gs.player.bench[1].card.name="benchcardname2";
            gs.player.bench[2].card.name="benchcardname3";
            gs.player.bench[0].card.name="evolveecardname1";
            gs.player.active.card.name="activecardname1";
            console.log("gs cahnged");

            GameStates.update({userid:Meteor.userId()},gs,{upsert:true});
        }
    },
    uploadCards(data: { fileString: string }) {
        if (Meteor.isServer) {
            parseCardString(data.fileString);
        }
    },
    uploadAbilities(data: { fileString: string }) {
        if (Meteor.isServer) {
            parseAbilityString(data.fileString)
        }
    },
    uploadDeck(data: { fileString: string }) {
        if (Meteor.isServer) {
            console.log(data.fileString);
        }
    },
});