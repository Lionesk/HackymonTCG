import { ExecutableAbilityAction, AbilityTarget, parseAmount, parseTarget } from "./Ability"
import { AbilityAction, Target } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";
import { GameState } from "../GameState";

export class Damage implements ExecutableAbilityAction {
  parsedTarget: AbilityTarget;
  amount: number;
  actualTarget?: PlayableCard;
  source: PlayableCard;
  
  constructor(state: GameState, abilityData: AbilityAction) {
    if (!state.player.active) {
      throw new Error("no pokemon to attack with");
    }
    
    if (abilityData.target) {
      this.parsedTarget = parseTarget(state, abilityData.target);
    }
    this.amount = parseAmount(state, abilityData); // do parsing for multiplied amount
    this.source = state.player.active;
  }
  
  execute(target?: AbilityTarget) {
    if (Array.isArray(target) || Array.isArray(this.parsedTarget)) {
      throw new Error("Invalid Target, should be s-ingle playable card");
    }
    // sort of wonky since target can be provided by front end
    if (target) {
      target.damage(this.amount);
      this.actualTarget = target;
    } else {
      this.parsedTarget.damage(this.amount);
      this.actualTarget = this.parsedTarget;
    }
    
  }

  toString() {
    if (!this.actualTarget) {
      throw new Error("Ability has not yet been executed");
    }

    return `${this.source.card.name} attacked ${this.actualTarget.card.name} dealing ${this.amount} damage`
  }
}
