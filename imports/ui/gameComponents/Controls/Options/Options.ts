import './Options.html'
import './Options.css'
import {Template} from 'meteor/templating'
import {Session} from 'meteor/session'
import { MoveStateController } from "../../../layouts/PlayLayout/MoveState"

declare let FlowRouter: any;


Template.Options.helpers({
    isEnergySelected:function(){
        if(this.moveState==undefined){
            return false
        }else{
            return this.moveState.selectedEnergyCard != null;
        }
    },
    isEvolverSelected:function(){
        if(this.moveState==undefined){
            return false
        }else if(this.moveState.selectedEvolutionPokemonCard==undefined){
            return false 
        }else{
            return this.moveState.selectedEvolutionPokemonCard.card.evolution;
        }
    },
    getSize:function(array){
        if(!array){
            return "0";
        }else if(array.length ===0){
            return "0";
        }else{
            return array.length;
        }
    }
});

Template.Options.events({
    "click .end-game":function(){
        Meteor.call('upsertNewGameState')
        let ms = Session.get("move-state");
        MoveStateController.resetMoveState(ms);
        Session.set("move-state",ms);
        FlowRouter.go('/');
    },
    "click .end-turn":function(){
        Meteor.call('endTurn');
        let ms = Session.get("move-state");
        MoveStateController.resetMoveState(ms);
        Session.set("move-state",ms);
    }
});