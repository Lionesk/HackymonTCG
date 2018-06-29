import './Card.html';
import "./Card.css";
import "./Ability/Ability.ts";
import { Template } from 'meteor/templating';
import {Abilities, CardType, EnergyCat } from '../../../api/collections';

Template.Card.helpers({
    getAbility: function(abilityIndex){
        return Abilities.find({index:abilityIndex}).fetch()[0];
    },
    isPokemon:function(){
        return this.playableCard.card.type === CardType.POKEMON;
    },
    isEvolution:function(){
        return this.playableCard.card.evolution !==null&&this.playableCard.card.evolution !==undefined;
    },
    isEnergy:function(){
        return this.playableCard.card.type === CardType.ENERGY;
    },
    fadedClass:function(){
        if(this.energyPlayed&&this.playableCard.card.type === CardType.ENERGY){
            return "faded"
        }
    },
    getEnergyList(){
        if(!this.playableCard.currentEnergy){
            return;
        }
        let eList=[];
        let keys = Object.keys(EnergyCat);
        for( let i=0; i<keys.length;i++){
            let eCount =0;
            for(let j=0;j<this.playableCard.currentEnergy.length;j++){
                    if(EnergyCat[keys[i]] == this.playableCard.currentEnergy[j].category){
                        eCount++;
                    }
            }
            if(eCount>0){
                let eObj ={};
                eObj[EnergyCat[keys[i]]]=eCount;
                eList.push(eObj)
            };
        }
        console.log(eList);
    },
    getEnergyKey:function(energy){
      return  Object.keys(energy)[0];
    },
    getCurrentHealth:function(){
        if(!this.playableCard.currentDamage){
            this.playableCard.currentDamage=0;
        }
      return  this.playableCard.card.healthPoints - this.playableCard.currentDamage;
    }

});