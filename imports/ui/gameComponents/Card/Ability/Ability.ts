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
        }else if(action.type ===AbilityType.CONDITIONAL){
            str = str.concat("On ");
        }else{
            str = str.concat("Apply ");
        }
        if(action.source){
            str = str.concat("from "+action.source+" ");
        }
        if(action.amount){
            str = str.concat(action.amount+" ");
        }
        if(action.type){
            let typestr ="";
            switch(action.type){
                case AbilityType.APPLY_STAT:
                    typestr = "";
                break;
                case AbilityType.CONDITIONAL:
                    typestr = "condition:";
                break;
                case AbilityType.DAMAGE:
                    typestr = "damage";
                break;
                default:
                    typestr = action.type;
                break;
            }
            str = str.concat(typestr+" ");
        }
        if(action.status){
            str = str.concat("status "+action.status+" ");
        }
        if(action.target){
            str = str.concat("to "+action.target.replace("-"," ")+" ");
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
            str = str.concat("filter by "+action.filter.category+" ");
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

