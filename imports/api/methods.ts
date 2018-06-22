import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "./collections";

Meteor.methods({
    printToServerConsole() {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    },
    uploadCards(data: { cardString: string }) {
        if (Meteor.isServer) {
            console.log(data.cardString);
        }
    },
    uploadAbilities(data: { cardString: string }) {
        if (Meteor.isServer) {
            console.log(data.cardString);
        }
    },
    uploadDeck(data: { cardString: string }) {
        if (Meteor.isServer) {
            console.log(data.cardString);
        }
    },
});