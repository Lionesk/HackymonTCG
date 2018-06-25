import './Active.html';
import './Active.css';
import '../Card/Card.ts';

import { Template } from 'meteor/templating'

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
        }
        else{
            return true;
        }
    }
});