import './Board.html';
import './Board.css';
import '../AISide/AISide.ts';
import '../PlayerSide/PlayerSide.ts';
import '../Controls/Controls.ts';
import '../../partials/DiscardModal/DiscardModal.ts';

import { Template } from 'meteor/templating'

declare let FlowRouter:any

Template.Board.events({
    'click .changeTestGameState'(){
        Meteor.call('testModifyGameState',function(){
            FlowRouter.go('/play');
        });
    },
    'click .initializeGame':function () {
        Meteor.call('newGameStart', {shuffle: false});
    },
});
Template.Board.helpers({
    reverseCombatLog:function(){
        return this.gamestate.combatLog.reverse();
    }
})
Template.Bench.helpers({
    isActivePlaced(){
        return this.gamestate.player.active !==null&& this.gamestate.player.active !==undefined;
    },
})

