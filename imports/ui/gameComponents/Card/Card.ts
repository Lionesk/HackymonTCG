import './Card.html';
import "./Card.css";
import "./Ability/Ability.ts";
import { Template } from 'meteor/templating';
import { Abilities } from '../../../api/collections/abilities';


Template.Card.helpers({
    getAbility: function(abilityIndex){
        return Abilities.find({index:abilityIndex}).fetch()[0];
    }
});