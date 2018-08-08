import { AbilityAction, AbilityType, Choice, Target } from "../api/collections/abilities";
import { GameStates } from "../api/collections";
import { PlayableCard } from "../gameLogic/PlayableCard";
import { Session } from "meteor/session";

export async function executeAbility(ability:any, abilityIndex:number,playableCard:PlayableCard){
    let yourChoice=false;
        let actionIndex=-1;
        if(ability.actions.find((elem:AbilityAction,index:number)=>{
            actionIndex=index;console.log(elem.choice);
            return (elem.choice!==Choice.OPPONENT 
                && elem.choice!==Choice.RANDOM 
                &&elem.choice!==undefined)})
                // ||elem.type===AbilityType.SEARCH})
        ){
            yourChoice=true;
        }
        console.log("Your choice? "+ yourChoice+" index: " +actionIndex);
        if(!yourChoice){
            let ms = Session.get("move-state");
            if(!ms.selectedEnergyCard&& !ms.selectedEvolutionPokemonCard){
                console.log(" ability: called "+ abilityIndex);    
                Meteor.call("executeAbility",true, playableCard,abilityIndex)
            }
        }else{
            let gs = await GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            let choices:any;
            choices={};
            let action=ability.actions[actionIndex];
            switch(action.target){
                    case Target.OPPONENT_BENCH:
                    choices["aiBench"]=gs.ai.bench;
                    break;
                    case Target.OPPONENT_DISCARD:
                    choices["aiDiscard"]=gs.ai.discardPile;
                    break;
                    case Target.OPPONENT_DECK:
                    choices["aiDeck"]=gs.ai.deck;
                    break;
                    case Target.YOUR_BENCH:
                    choices["bench"]=gs.player.bench;
                    break;
                    case Target.YOUR_DISCARD:
                    choices["discard"]=gs.player.discardPile;
                    break;
                    case Target.YOUR_DECK:
                    choices["deck"]=gs.player.deck;
                    break;
                    case Target.YOUR_POKEMON:
                    choices["bench"]=gs.player.bench;
                    // choices["hand"]=gs.player.hand;
                    choices["active"]=[gs.player.active];
                    break;
                    case Target.YOUR:
                    choices["bench"]=gs.player.bench;
                    choices["active"]=[gs.player.active];
                    break;
                    case Target.THEM:
                    choices["bench"]=gs.ai.bench;
                    choices["active"]=[gs.ai.active];
                    break;                    case Target.YOUR:
                    choices["bench"]=gs.player.bench;
                    choices["active"]=[gs.player.active];
                    break;
                    case Target.YOU:
                    choices["bench"]=gs.ai.bench;
                    choices["active"]=[gs.ai.active];
                    break;
            }
            Session.set("ability",{
                "ability":ability,
                "actionIndex":actionIndex,
                "choices":choices,
                "targets":[],
                "playableCard":playableCard,                
            });

            let modal = document.getElementById('ChoiceModal');
            if(modal){
                modal.style.display = 'block';
            }
        }
}