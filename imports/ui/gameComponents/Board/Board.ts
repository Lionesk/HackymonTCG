import './Board.html';
import './Board.css';
import '../AISide/AISide.ts';
import '../PlayerSide/PlayerSide.ts';
import '../Controls/Controls.ts';

import { Template } from 'meteor/templating'

Template.Board.events({
    'click .changeTestGameState':function(){
        Meteor.call('testModifyGameState');
    }
})

