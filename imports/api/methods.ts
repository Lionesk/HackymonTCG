import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat } from "./collections";
import { parseAbilityString, parseCardString } from "../util/fileParsers";

Meteor.methods({
    printToServerConsole() {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
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