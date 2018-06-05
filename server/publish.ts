import { Cards } from "../collections";

Meteor.publish('cards', () => Cards.find());
