import './Board.html';
import { Template } from 'meteor/templating'

Template.Board.events({
    'click .changeStateRoundNumber':function(){
        Meteor.call('testModifyGameState');
    }
})