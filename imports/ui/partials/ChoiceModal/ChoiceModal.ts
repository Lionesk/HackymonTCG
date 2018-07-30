import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './ChoiceModal.html';
import './ChoiceModal.css';
import '../../gameComponents/Card/Card.ts'
import { PlayableCard } from '../../../gameLogic/PlayableCard';
import { Target } from '../../../api/collections';

Template.ChoiceModal.helpers({
    getTargets:function(){
        return Session.get("ability").targets||null;
    },
    isPokemonOnly:function(){
        if(Session.get("ability").actionIndex>-1){
            return Session.get("ability").ability.actions[Session.get("ability").actionIndex].choice === Target.YOUR_POKEMON;
        }
    }
})
Template.DisplayCard.helpers({
    choseThis:function(){
        if(this.chose){
            return "chosen";
        }else{
            return "";
        }
    }
})
Template.DisplayCard.onCreated(function(){
    this.chose =false;
})

Template.ChoiceModal.onCreated(function(){
    Session.set("ability",{
        "ability":{},
        "choices":{},
        "actionIndex":-1,        
        "targets":[],
    });
})

Template.ChoiceModal.events({
   "click #cancelTarget":function(){
        let modal = document.getElementById('ChoiceModal');
        if(modal){
            //console.log("modal2")
            modal.style.display = 'none';
        }
        Session.set("ability",{
            "ability":{},
            "actionIndex":-1,            
            "choices":{},
            "targets":[],
        });
    },
   
})

Template.DisplayCard.events({
    "click .cardChoice":function(event:JQuery.Event){
        //console.log(event.currentTarget);
        
       let ac = Session.get("ability");
       if(!ac.targets.find((elem:PlayableCard)=>{return elem.id===this.card.id&&elem.card.name===this.card.card.name})){
        ac.targets.push(this.card);
       }else{
        ac.targets = ac.targets.filter((elem:PlayableCard)=>{
            return elem.id!==this.card.id&&elem.card.name!==this.card.card.name
        })
       }
       if(ac.targets.length>ac.ability.actions[ac.actionIndex].amount){
           ac.targets.shift();
       }
       Session.set("ability",ac);
       if(ac.targets.find((elem:PlayableCard)=>{return elem.id===this.card.id&&elem.card.name===this.card.card.name})){
            //console.log(this.chose)
            this.chose=true;
            //console.log(this.chose)
       }
    }
})