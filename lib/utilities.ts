import { Meteor } from "meteor/meteor";

Meteor.methods({
    printToServerConsole: function () {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    }
});