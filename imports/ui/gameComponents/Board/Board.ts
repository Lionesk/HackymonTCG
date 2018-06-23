import './Board.html';
import { Template } from 'meteor/templating'

Template.Board.events({
    'click .changeStateRoundNumberTest':function(){
        Meteor.call('testModifyGameState');
    }
})