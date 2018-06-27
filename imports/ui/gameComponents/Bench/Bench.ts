import './Bench.html';
import './Bench.css';
import '../Card/Card.ts';
import { CardType } from "../../../api/collections";
import {MoveStateController} from "../../layouts/PlayLayout/MoveState"
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { PlayableCard } from '../../../gameLogic/PlayableCard';

Template.Bench.helpers({
    isCardDefined:function(playableCard){
        if(playableCard==undefined){
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
    "click .bench-card": async function(event){
        if(this.isNotInteractable){
            return;
        }
        let playableCardName = event.currentTarget.getElementsByClassName("playable-card")[0].getAttribute("data-playable-card-name")
        let playableCard;
        console.log(this);
        await Promise.all(this.bench.map(async (pc: PlayableCard) => {
            if(pc!=null){
                if(pc.card.name == playableCardName){
                    playableCard = pc;

                    if(playableCard.card.type == CardType.POKEMON){
                        let ms = Session.get("move-state");
                        await MoveStateController.setPokemon(ms, playableCard);
                        Session.set("move-state", ms);
                    }
                }
                
            }
        }));
    }
});