import './Ability.css'
import './Ability.html'
import { Template } from 'meteor/templating'
import { Abilities, AbilityType, Ability, AbilityAction } from '../../../../api/collections/abilities';
import { EnergyCat } from '../../../../api/collections/Cards';

Template.Action.helpers({
    isCond:function(action: AbilityAction){
        return action.type === "cond";
    },
    isApplyStat:function(action: AbilityAction){
        return action.type === "applystat";        
    }
});
Template.Ability.helpers({
    getCostValue:function(cost: EnergyCat){
        return this.abilityCost[cost];
    },
    getCostKeys:function(){
        return Object.keys(this.abilityCost);
    },
    costExists:function(){
        return this.abilityCost!=undefined;
    }
})

