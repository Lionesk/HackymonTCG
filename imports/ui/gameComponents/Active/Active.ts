import "jquery";
import './Active.html';
import './Active.css';
import '../Card/Card.ts';
import {MoveStateController} from "../../layouts/PlayLayout/MoveState"
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { PlayableCard } from "../../../gameLogic/PlayableCard";
import '../../partials/ChoiceModal/ChoiceModal';
import { GameStates, Choice } from "../../../api/collections";
import { AbilityAction, AbilityType, Target, Status } from "../../../api/collections/abilities";
import { executeAbility } from "../../abilityHelper";

Template.Active.helpers({
    isCardDefined:function(playableCard: PlayableCard){
        if(!playableCard){
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
    getCostValue:function(cost:any){
        return this.active.card.retreatCost[cost];
    },
    getCostKeys:function(){
        return Object.keys(this.active.card.retreatCost);
    },
    getChoices:function(){
        if(Session.get("ability")){
            return Session.get("ability").choices;
        }
    },
    isRetreatSelected:function(){
        if(Session.get("move-state").retreating){
            return "retreat-selected";
        }        
    }
});

Template.Active.events({
    "click .active-card":function(event: JQuery.Event){
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
    "click .active-card .ability":async function(event: JQuery.Event){
        if(this.isNotInteractable || this.isFirstRound || this.isSecondRound){
            console.log("RETURN")
            return;
        }
        let isParalyzed=false;
        let isSleep=false;
        if(this.playableCard){
            isParalyzed=this.playableCard.statuses.find((stat:Status)=>{return stat===Status.PARALYZED})?true:false;
            isSleep = this.playableCard.statuses.find((stat:Status)=>{return stat===Status.SLEEP})?true:false;
        }
        if(!(isParalyzed||isSleep)){
            executeAbility(this.ability,this.abilityIndex,this.playableCard);
        }else{
            if(isParalyzed){
                Meteor.call("appendCombatLog", "Your "+this.playableCard+" is paralyzed and can't attack!")
            }
            if(isParalyzed){
                Meteor.call("appendCombatLog", "Your "+this.playableCard+" is asleep and can't attack!")
            }
        }
    },
    "click .retreat":function(event:JQuery.Event){
        let isStuck=false;
        let isParalyzed=false;
        let isSleep=false;
        if(this.playableCard){
            isStuck=this.playableCard.statuses.find((stat:Status)=>{return stat===Status.STUCK})?true:false;
            isParalyzed=this.playableCard.statuses.find((stat:Status)=>{return stat===Status.PARALYZED})?true:false;
            isSleep = this.playableCard.statuses.find((stat:Status)=>{return stat===Status.SLEEP})?true:false;
        }
        if(!(isParalyzed||isSleep||isStuck)){
            let ms = Session.get("move-state");
            MoveStateController.setRetreat(ms);
            Session.set("move-state",ms);
        }else{
            if(isParalyzed){
                Meteor.call("appendCombatLog", "Your "+this.playableCard+" is paralyzed and can't retreat!")
            }
            if(isParalyzed){
                Meteor.call("appendCombatLog", "Your "+this.playableCard+" is asleep and can't retreat!")
            }
            if(isStuck){
                Meteor.call("appendCombatLog", "Your "+this.playableCard+" is stuck and can't retreat!")                
            }
        }
    },
});