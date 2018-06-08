import { Template } from 'meteor/templating'
import './UploadDeck.html'
import { Cards, CardType, TrainerCat } from "../../../api/collections";

Template.UploadDeck.events({
    'click .printToServer':function(){
        Cards.insert({
            type: CardType.TRAINER,
            category: TrainerCat.STADIUM,
            name: "Cool City Stadium",
        });
        
        Meteor.call('printToServerConsole'); //defined in lib/utilities.ts
        console.log(Cards.find().count());
    
    },
});


