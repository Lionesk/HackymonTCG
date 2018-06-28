import './Options.html'
import './Options.css'
import {Template} from 'meteor/templating'

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
    }
});

Template.Options.events({
    "click .end-game":function(){
        Meteor.call('upsertNewGameState');
        FlowRouter.go('/');
    }
});