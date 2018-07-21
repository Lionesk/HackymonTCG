import { ExecutableAbilityAction, AbilityTarget, parseTarget, parseAmount } from "./Ability";
import { GameState } from "../GameState";
import { AbilityAction } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";

export class Heal implements ExecutableAbilityAction {
  parsedTarget?: AbilityTarget;
  amount: number;
  actualTarget?: PlayableCard;

  constructor(state: GameState, data: AbilityAction) {
    if (data.target) {
      this.parsedTarget = parseTarget(state, data.target);
    }
    this.amount = parseAmount(state, data); // do parsing for multiplied amount
  }

  execute(target?: AbilityTarget) {
    if (Array.isArray(target) || Array.isArray(this.parsedTarget)) {
      throw new Error("Invalid Target, should be s-ingle playable card");
    }
    // sort of wonky since target can be provided by front end
    if (target) {
      this.actualTarget = target;
      target.heal(this.amount);
    } else if (this.parsedTarget) {
      this.parsedTarget.heal(this.amount);
      this.actualTarget = this.parsedTarget;
    } else {
      throw new Error("no target for ability");
    }
  }

  toString(): string {
    if (!this.actualTarget) {
      throw new Error("Ability has not yet executed, cannot generate message");
    }
    return `Healed ${this.actualTarget.card.name} for ${this.amount}`;
  }
}
