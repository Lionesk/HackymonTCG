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
    },
    topActionString:function(action: AbilityAction){
        let str = "Apply ";
        if(action.amount){
            str = str.concat(action.amount+" ");
        }
        if(action.type){
            str = str.concat(action.type+" ");
        }
        if(action.type){
            str = str.concat(action.type+" ");
        }
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

