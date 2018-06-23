import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "./collections";
import { GameStates } from "./collections";
import { GameState } from "../gameLogic/GameState";

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
    testModifyGameState:function(){
        if(Meteor.isServer){
            //simulates a change done by the gamemanager
            let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            gs.round=++gs.round;
            GameStates.update({userid:Meteor.userId()},gs,{upsert:true});
        }
    }
});