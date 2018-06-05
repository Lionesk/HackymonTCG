import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "../collections";

Meteor.methods({
    printToServerConsole: () => {
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