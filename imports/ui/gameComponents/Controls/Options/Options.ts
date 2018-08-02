import './Options.html'
import './Options.css'
import {Template} from 'meteor/templating'
import {Session} from 'meteor/session'
import { MoveStateController } from "../../../layouts/PlayLayout/MoveState"

declare let FlowRouter: any;


Template.Options.helpers({
    isEnergySelected() {
        if(this.moveState==undefined){
            return false
        }else{
            return this.moveState.selectedEnergyCard != null;
        }
    },
    isEvolverSelected() {
        if(this.moveState==undefined){
            return false
        }else if(this.moveState.selectedEvolutionPokemonCard==undefined){
            return false 
        }else{
            return this.moveState.selectedEvolutionPokemonCard.card.evolution;
        }
    },
    getSize(array?: any[]){
        if(!array){
            return "0";
        }else if(array.length === 0){
            return "0";
        }else{
            return array.length;
        }
    },
    isRetreating:function(){
        return this.moveState.retreating;
    },
    isExpandedCombatLog:function(){
        return Session.get("expand-combat-log")?"expand-combat-log":"";
    }
});

Template.Options.events({
    "click .end-game"() {
        Meteor.call('upsertNewGameState')
        let ms = Session.get("move-state");
        MoveStateController.resetMoveState(ms);
        Session.set("move-state",ms);
        FlowRouter.go('/');
    },
    "click .end-turn"() {
        if(this.active){
            Meteor.call('endTurn');
            let ms = Session.get("move-state");
            MoveStateController.resetMoveState(ms);
            Session.set("move-state",ms);
        }
    },
    "click .mini-view"(){
        let isMini = Session.get('is-mini');
        Session.set('is-mini',!isMini);
    },
    "click .combat-log"(){
        Session.set("expand-combat-log",!Session.get("expand-combat-log"))
    },    
});