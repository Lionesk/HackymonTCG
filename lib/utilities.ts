import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "../collections/Cards";

Meteor.methods({
    printToServerConsole: function () {
        if(Meteor.isServer){
            // Cards.insert({
            //     type: CardType.POKEMON,
            //     category: PokemonCat.BASIC,
            // });
            console.log(Cards.find().count());
            console.log("Printing To Server Console");
        }
    }
});