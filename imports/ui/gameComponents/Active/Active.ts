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
    }
});

Template.Active.events({
    // "click .ability":function(event){
    //     if(this.isNotInteractable){
    //         return;
    //     }
    //     //data-ability-index
    //     let abilityIndex =event.currentTarget.getAttribute("data-ability-index");
    //     console.log(" ability: "+abilityIndex);
    //     console.log(" this: "+JSON.stringify(this));
    //     // if(this.)
    //     console.log("abilit click");
    // },
    "click .active-card .ability":function(event){
        if(this.isNotInteractable){
            return;
        }
        console.log("active click");
        // let ms = Session.get("move-state");
        // MoveStateController.setPokemon(ms,this.active);
        // Session.set("move-state",ms);
    }
});