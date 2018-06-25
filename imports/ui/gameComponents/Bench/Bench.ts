import './Bench.html';
import './Bench.css';
import '../Card/Card.ts';

import { Template } from 'meteor/templating'

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

