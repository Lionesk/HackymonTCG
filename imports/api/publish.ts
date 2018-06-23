import { Cards } from "./collections";
import { GameStates } from "./collections";

Meteor.publish('cards', () => Cards.find());
Meteor.publish('gamestates', () => GameStates.find());
