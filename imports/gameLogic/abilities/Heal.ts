import { ExecutableAbilityAction, AbilityTarget, parseTarget, parseAmount } from "./Ability";
import { GameState } from "../GameState";
import { AbilityAction } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";
import { Player } from "../Player";

export class Heal implements ExecutableAbilityAction {
  parsedTarget: AbilityTarget;
  amount: number;
  actualTargets?: PlayableCard[];

  constructor(data: AbilityAction, playing: Player, opponent: Player) {
    if (data.target) {
      this.parsedTarget = parseTarget(data.target, playing, opponent);
    }
    this.amount = parseAmount(data, playing, opponent); // do parsing for multiplied amount
  }

  execute(target?: PlayableCard[]) {
    this.actualTargets = ([] as PlayableCard[]).concat(target || this.parsedTarget);
    this.actualTargets.forEach(target => target.heal(this.amount));
  }

  toString(): string {
    if (!this.actualTargets) {
      throw new Error("Ability has not yet executed, cannot generate message");
    }
    return `${this.actualTargets.map(card => card.card.name).join(", ")} ${this.actualTargets.length === 1 ? "was" : "where"} healed for ${this.amount}`;
  }
}
