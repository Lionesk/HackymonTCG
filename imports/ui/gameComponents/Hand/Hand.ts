import './Hand.html';
import './Hand.css';
import '../Card/Card.ts';
import { Template } from 'meteor/templating'
import { CardType } from "../../../api/collections";
import {Session} from "meteor/session";
import {MoveStateController} from "../../layouts/PlayLayout/MoveState"

Template.Hand.helpers({
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

Template.Hand.events({
    "click .hand-card":function(event){
        if(this.isNotInteractable){
            return;
        }
        let playableCardName =event.currentTarget.getElementsByClassName("playable-card")[0].getAttribute("data-playable-card-name")
        // console.log(playableCardName);
        let playableCard;
        this.hand.forEach((pc) => {
            console.log(pc);
            if(pc.card.name == playableCardName){
                playableCard=pc;
                // console.log("playableCard");
                // console.log(playableCard);

                if(playableCard.card.type== CardType.POKEMON){
                    
                    let ms = Session.get("move-state");
                    if(ms.selectedPokemonCard){
                        if(playableCard.card.name==ms.selectedPokemonCard.card.evolution||playableCard.card.evolution==ms.selectedPokemonCard.card.name){
                            MoveStateController.setPokemon(ms,playableCard);
                            Session.set("move-state",ms);
                        }
                        else{
                            Meteor.call("benchPokemon",playableCard);
                        }
                    }
                }
        
                if(playableCard.card.type== CardType.ENERGY){
                    let ms = Session.get("move-state");
                    // console.log(ms);
                    MoveStateController.setEnergy(ms,playableCard);
                    Session.set("move-state",ms);
                    //ms.pubSetEnergy(playableCard);
                }
            }
        });
    }
});