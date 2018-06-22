import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "./collections";
import {gameManager} from '../startup/server/startup'
Meteor.methods({
    printToServerConsole: function () {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    },
    getInitialGameState: function () {
        if(Meteor.isServer){
            console.log("gameManager.gameState: " + gameManager.gameState);
            return gameManager.gameState;
        }
    }
});