import "jquery";
import './Active.html';
import './Active.css';
import '../Card/Card.ts';
import {MoveStateController} from "../../layouts/PlayLayout/MoveState"
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { PlayableCard } from "../../../gameLogic/PlayableCard";
import '../../partials/ChoiceModal/ChoiceModal';
import { GameStates } from "../../../api/collections";

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
        return Session.get("choices");
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
        if(this.isNotInteractable && this.isFirstRound || this.isSecondRound){
            return;
        }
        console.log(this.ability.choice)

        let gs = await GameStates.find({"userid":Meteor.userId()}).fetch()[0];
        Session.set("choices",{
            aiBench:gs.ai.bench,
            aiActive:[gs.ai.active],
            aiHand:gs.ai.hand,
            bench:gs.player.bench,
            active:[gs.player.active],
            hand:gs.player.hand
        });

        let modal = document.getElementById('ChoiceModal');
        if(modal){
            console.log("modal2")
            modal.style.display = 'block';

        }

        let ms = Session.get("move-state");
            if(!ms.selectedEnergyCard&& !ms.selectedEvolutionPokemonCard){
                console.log(" ability: called "+ this.abilityIndex);    
                console.log("COST")
                console.log(this.abilityCost)
                Meteor.call("executeAbility",true, this.playableCard,this.abilityIndex)
            }
        console.log("active click");
    },
    "click .retreat":function(event:JQuery.Event){
        let ms = Session.get("move-state");
        MoveStateController.setRetreat(ms);
        Session.set("move-state",ms);
    }
});

export  function isCardDefined(){
    
}