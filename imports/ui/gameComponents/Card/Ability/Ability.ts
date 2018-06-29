import './Ability.css'
import './Ability.html'
import { Template } from 'meteor/templating'
import { Abilities } from '../../../../api/collections/abilities';

Template.Action.helpers({
    isCond:function(action){
        return action.type === "cond";
    },
    isApplyStat:function(action){
        return action.type === "applystat";        
    }
});
Template.Ability.helpers({
    getCostValue:function(cost){
        return this.abilityCost[cost];
    },
    getCostKeys:function(){
        return Object.keys(this.abilityCost);
    },
    costExists:function(){
        return this.abilityCost!=undefined;
    }
})

