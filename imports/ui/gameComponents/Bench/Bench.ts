import "jquery";
import './Bench.html';
import './Bench.css';
import '../Card/Card.ts';
import { CardType } from "../../../api/collections";
import {MoveStateController} from "../../layouts/PlayLayout/MoveState"
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { PlayableCard } from '../../../gameLogic/PlayableCard';

Template.Bench.helpers({
    isCardDefined(playableCard: PlayableCard) {
        if(!playableCard){
            return false;
        }
        if(Object.keys(playableCard).length === 0){
            return false;
        }
        if(Object.keys(playableCard.card).length === 0){
            return false;
        }
        else{
            return true;
        }
    }
});

Template.Bench.events({
    async "click .bench-card"(event: JQuery.Event){
        if(this.isNotInteractable && this.isFirstRound){
            return;
        }
        let playableCardId = (event.currentTarget as HTMLElement).getElementsByClassName("playable-card")[0].getAttribute("data-playable-card-id")
        let playableCard;
        console.log(this);
        await Promise.all(this.bench.map(async (pc: PlayableCard) => {
            if(pc!=null){
                if(playableCardId && pc.id === parseInt(playableCardId)){
                    playableCard=pc;

                    if(playableCard.card.type == CardType.POKEMON){
                        let ms = Session.get("move-state");
                        console.log("ms from bench");
                        // console.log(ms);
                        // console.log(this.active);
                        // console.log(!this.active);
                        if(!ms.selectedEnergyCard&& !ms.selectedEvolutionPokemonCard && !this.active){
                            console.log("place ui active")
                            Meteor.call("placeActive",true,playableCard);
                            // MoveStateController.resetMoveState(ms);
                            // Session.set("move-state", ms);                            
                        }else{
                            await MoveStateController.setPokemon(ms, playableCard);
                            Session.set("move-state", ms);
                        }
                    }
                }
                
            }
        }));
    }
});