import { Cards, Abilities } from "./collections";
import { GameStates } from "./collections";

Meteor.publish('cards', () => Cards.find());
Meteor.publish('gamestates', () => GameStates.find());
Meteor.publish('abilities', () => Abilities.find());
