import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "./collections";

Meteor.methods({
    printToServerConsole: function () {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    }
});