import { Mongo } from "meteor/mongo";
import { CardType, CardCategory } from "./Cards";

export enum AbilityType {} // TODO

export enum Target {} // TODO

export enum Choice {
  YOURS = "yours",
  OPPONENT = "opponent",
  RANDOM = "random",
}

export enum Status {
  PARALYZED = "paralyzed",
  SLEEP = "sleep",
  STUCK = "stuck",
  POISONED = "poisoned",
}

export interface Ability {
  type: AbilityType;
  source?: Target;
  destination?: Target;
  choice?: Choice;
  filter?: {
    category?: CardCategory;
    type?: CardType;
  }
  amount?: number;
}

let Abilities: Mongo.Collection<Ability>;
if(!Abilities) {
  Abilities = new Mongo.Collection<Ability>("abilities");
}

export { Abilities };
