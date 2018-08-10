import { ExecutableAbilityAction, AbilityTarget, parseAmount, parseTarget } from "./Ability"
import { AbilityAction, Target } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";
import { GameState } from "../GameState";
import { Player } from "../Player";

export class Damage implements ExecutableAbilityAction {
  parsedTarget: AbilityTarget;
  amount: number;
  actualTargets?: PlayableCard[];
  source: PlayableCard;
  constructor(abilityData: AbilityAction, playing: Player, opponent: Player) {
    if (!playing.active) {
      throw new Error("no pokemon to attack with");
    }
    
    if (abilityData.target) {
      this.parsedTarget = parseTarget(abilityData.target, playing, opponent);
      if (abilityData.choice) {
        this.parsedTarget = (this.parsedTarget as PlayableCard[])[0]
      }
    }
    this.amount = parseAmount(abilityData, playing, opponent); // do parsing for multiplied amount
    this.source = playing.active;
  }
  
  execute(target?: PlayableCard[]) {
    // sort of wonky since target can be provided by front end
    this.actualTargets = ([] as PlayableCard[]).concat(target || this.parsedTarget);
    this.actualTargets.forEach(target => target.damage(this.amount));
  }

  toString() {
    if (!this.actualTargets) {
      throw new Error("Ability has not yet been executed");
    }

    return `${this.source.card.name} attacked ${this.actualTargets.map(card => card.card.name).join(", ")} dealing ${this.amount} damage ${this.actualTargets.length > 1 ? "to each" : ""}`;
  }
}
