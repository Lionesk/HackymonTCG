import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "./collections";
import { GameStates, Card } from "./collections";
import { GameState } from "../gameLogic/GameState";
import { PlayableCard } from "../gameLogic/PlayableCard";

Meteor.methods({
    printToServerConsole: function () {
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
            gs.player.hand[0].card.name="handcardname";
            gs.player.hand[2].card.name="handcardname";
            gs.player.hand[1].card.name="handcardname";
            gs.player.bench[1].card.name="benchcardname";
            gs.player.bench[2].card.name="benchcardname";
            gs.player.bench[0].card.name="benchcardname";
            gs.player.active.card.name="activecardname";

            GameStates.update({userid:Meteor.userId()},gs,{upsert:true});
        }
    }
});