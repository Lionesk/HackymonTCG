import { Mongo } from "meteor/mongo";
import { CardType, CardCategory } from "./Cards";

export enum AbilityType {
  DECK = "deck",
  DAMAGE = "dam",
  REDAMAGE = "redamage",
  CONDITIONAL = "cond",
  HEAL = "heal",
  APPLY_STAT = "applystat",
  DESTAT = "destat",
  SEARCH = "search",
  REENERGIZE = "reenergize",
  DEENERGIZE = "deenergize",
  DRAW = "draw",
  SHUFFLE = "shuffle",
  ADD = "add",
} // TODO

export enum Target {
  YOUR_ACTIVE = "your-active",
  OPPONENT_ACTIVE = "opponent-active",
  OPPONENT = "opponent",
  YOUR = "your",
  YOUR_BENCH = "your-bench",
  OPPONENT_BENCH = "opponent-bench",
  THEM = "them",
  YOU = "you",
} // TODO

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
  name: string;
  actions: AbilityAction[];
}

export enum AbilityFunction {
  COUNT = "count",
}

export interface AbilityAction {
  type: AbilityType;
  source?: Target;
  destination?: Target;
  choice?: Choice;
  conditionalAbility?: {
    true?: AbilityAction;
    false?: AbilityAction;
  };
  filter?: {
    category?: CardCategory;
    type?: CardType;
  }
  amount?: number;
  multiplierTarget?: Target;
  multiplierFunction?: AbilityFunction;
}

let Abilities: Mongo.Collection<Ability>;
if(!Abilities) {
  Abilities = new Mongo.Collection<Ability>("abilities");
}

export { Abilities };
