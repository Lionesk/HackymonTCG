import { Cards, Abilities, Decks } from "./collections";
import { GameStates } from "./collections";

Meteor.publish('cards', () => Cards.find());
Meteor.publish('gamestates', () => GameStates.find());
Meteor.publish('abilities', () => Abilities.find());
Meteor.publish('decks', () => Decks.find());
