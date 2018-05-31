import { Cards } from "../collections";

Meteor.publish('cards',
    function(){
        return Cards.find();
    });
