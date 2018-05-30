import { Template } from 'meteor/templating'

Template.UploadDeck.events({
    'click .printToServer':function(){
        Meteor.call('printToServerConsole');//defined in lib/utilities.ts
    },
});


