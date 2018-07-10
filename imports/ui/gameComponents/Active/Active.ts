import './Active.html';
import './Active.css';
import '../Card/Card.ts';
import {MoveStateController} from "../../layouts/PlayLayout/MoveState"
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

Template.Active.helpers({
    isCardDefined:function(playableCard){
        if(playableCard==undefined){
            return false;
        }
        if(Object.keys(playableCard).length === 0){
            return false;
        }
        if(Object.keys(playableCard.card).length === 0){
            return false;
        } else {
            return true;
        }
    },
    getCostValue:function(cost){
        return this.active.card.retreatCost[cost];
    },
    getCostKeys:function(){
        return Object.keys(this.active.card.retreatCost);
    },
});

Template.Active.events({
    "click .active-card":function(event){
        if(this.isNotInteractable){
            return;
        }
        // let abilityIndex =event.currentTarget.getAttribute("data-ability-index");
        // console.log(" ability: "+abilityIndex);
        console.log(" this: "+JSON.stringify(this));
        let ms = Session.get("move-state");
        if(!MoveStateController.isEmpty(ms)){
            console.log("abilit click");
            MoveStateController.setPokemon(ms,this.active);
            Session.set("move-state",ms);
        }
    },
    "click .active-card .ability":function(event){
        if(this.isNotInteractable&& this.isFirstRound&& this.isSecondRound){
            return;
        }
        let ms = Session.get("move-state");
            if(!ms.selectedEnergyCard&& !ms.selectedEvolutionPokemonCard){
                console.log(" ability: called "+ this.abilityIndex);    
                console.log("COST")
                console.log(this.abilityCost)
                Meteor.call("executeAbility",true, this.playableCard,this.abilityIndex)
            }
        console.log("active click");

    }
});