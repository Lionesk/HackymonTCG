import './Hand.html';
import './Hand.css';
import '../Card/Card.ts';
import { Template } from 'meteor/templating'

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
        console.log(event.currentTarget);
    }
});