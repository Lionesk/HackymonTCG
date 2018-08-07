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
        let str = "";
        if(action.choice){
            str = str.concat("Based on "+action.choice+" choice, apply ");
        }else{
            str = str.concat("Apply ");
        }
        if(action.source){
            str = str.concat("from "+action.source+", ");
        }
        if(action.amount){
            str = str.concat(action.amount+" ");
        }
        if(action.type){
            str = str.concat(action.type+" ");
        }
        if(action.status){
            str = str.concat("apply "+action.status+" ");
        }
        if(action.target){
            str = str.concat("to "+action.target+" ");
        }        
        if(action.amountFunction){
            str = str.concat("by "+action.amountOperator+" by "+ action.amountFunction);
        }
        if(action.amountFunctionTarget){
            str = str.concat("of "+action.amountFunctionTarget+" ");
        }
        return str;
    },
    bottomActionString:function(action: AbilityAction){
        let str = "";
        if(!action){
            return str;
        }
        if(!action.filter){
            return str;
        }
        if(action.filter.category){
            str = str.concat("Filter by "+action.filter.category+" ");
        }
        if(action.filter.top){
            str = str.concat("on "+action.filter.top?"top":"" +" ");
        }
        if(action.filter.top){
            str = str.concat("by "+action.filter.count +" cards ");
        }
        return str;
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

