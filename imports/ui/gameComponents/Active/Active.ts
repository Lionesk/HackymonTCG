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
import { AbilityAction, AbilityType, Target } from "../../../api/collections/abilities";

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
        return Session.get("ability").choices;
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
        let yourChoice=false;
        let actionIndex=-1;
        if(this.ability.actions.find((elem:AbilityAction,index:number)=>{
            actionIndex=index;console.log(elem.choice);
            return (elem.choice!==Choice.OPPONENT 
                && elem.choice!==Choice.RANDOM 
                &&elem.choice!==undefined)
                ||elem.type===AbilityType.SEARCH})
        ){
            yourChoice=true;
        }
        console.log("Your choice? "+ yourChoice+" index: " +actionIndex);
        if(!yourChoice){
            let ms = Session.get("move-state");
            if(!ms.selectedEnergyCard&& !ms.selectedEvolutionPokemonCard){
                console.log(" ability: called "+ this.abilityIndex);    
                Meteor.call("executeAbility",true, this.playableCard,this.abilityIndex)
            }
        }else{
            let gs = await GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            let choices:any;
            let action=this.ability.actions[actionIndex];
            switch(action.target){
                    case Target.OPPONENT_BENCH:
                    choices["aiBench"]=gs.ai.bench;
                    break;
                    case Target.OPPONENT_DISCARD:
                    choices["aiDiscard"]=gs.ai.discard;
                    break;
                    case Target.OPPONENT_DECK:
                    choices["aiDeck"]=gs.ai.deck;
                    break;
                    case Target.YOUR_BENCH:
                    choices["bench"]=gs.player.bench;
                    break;
                    case Target.YOUR_DISCARD:
                    choices["discard"]=gs.player.discard;
                    break;
                    case Target.YOUR_DECK:
                    choices["deck"]=gs.player.deck;
                    break;
                    case Target.YOUR_POKEMON:
                    choices["bench"]=gs.player.bench;
                    choices["hand"]=gs.player.hand;
                    choices["active"]=gs.player.active;
                    break;
            }
            Session.set("ability",{
                "ability":this.ability,
                "actionIndex":actionIndex,
                "choices":choices,
                "targets":[],
            });

            let modal = document.getElementById('ChoiceModal');
            if(modal){
                modal.style.display = 'block';
            }
        }

    },
    "click .retreat":function(event:JQuery.Event){
        let ms = Session.get("move-state");
        MoveStateController.setRetreat(ms);
        Session.set("move-state",ms);
    },
    "click #confirmTarget":function(){
        let ability = Session.get("ability");
        Meteor.call("executeAbility",true, this.playableCard,ability.ability.index,ability.targets)
        let modal = document.getElementById('ChoiceModal');
        if(modal){
            modal.style.display = 'none';
        }
        Session.set("ability",{
            "ability":{},
            "actionIndex":-1,            
            "choices":{},
            "targets":[],
        });
    }
});