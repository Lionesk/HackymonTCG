import { Template } from 'meteor/templating'
import { Cards, CardType, TrainerCat } from "../../../collections/Cards";

Template.UploadDeck.events({
    'click .printToServer':function(){
        Cards.insert({
            type: CardType.TRAINER,
            category: TrainerCat.STADIUM,
        });
        console.log(Cards.find().fetch());
        Meteor.call('printToServerConsole');//defined in lib/utilities.ts
    },
});


