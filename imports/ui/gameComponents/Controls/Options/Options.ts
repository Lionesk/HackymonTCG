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
        Meteor.call('endTurn');
        let ms = Session.get("move-state");
        MoveStateController.resetMoveState(ms);
        Session.set("move-state",ms);
    }
});