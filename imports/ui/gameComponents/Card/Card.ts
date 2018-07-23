import './Card.html';
import "./Card.css";
import "./Ability/Ability.ts";
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import {Abilities, CardType, EnergyCat } from '../../../api/collections';

let commonHelpers ={
    getAbility(abilityIndex: number) {
        return Abilities.find({index: abilityIndex}).fetch()[0];
    },
    isPokemon() {
        return this.playableCard.card.type === CardType.POKEMON;
    },
    isEvolution() {
        return this.playableCard.card.evolution !==null&&this.playableCard.card.evolution !==undefined;
    },
    isEnergy() {
        return this.playableCard.card.type === CardType.ENERGY;
    },
    fadedClass() {
        if(this.energyPlayed&&this.playableCard.card.type === CardType.ENERGY){
            return "faded"
        }
    },
    getCurrentHealth:function(){
        if(!this.playableCard.currentDamage){
            this.playableCard.currentDamage=0;
        }
      return  this.playableCard.card.healthPoints - this.playableCard.currentDamage;
    },
    isMiniView:function(){
        return Session.get('is-mini') || this.miniView;
    }
};

Template.Card.helpers(commonHelpers);
Template.miniCard.helpers(commonHelpers);