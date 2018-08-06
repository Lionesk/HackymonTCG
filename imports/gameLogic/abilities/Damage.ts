import { ExecutableAbilityAction, AbilityTarget, parseAmount, parseTarget } from "./Ability"
import { AbilityAction, Target } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";
import { GameState } from "../GameState";
import { Player } from "../Player";

export class Damage implements ExecutableAbilityAction {
  parsedTarget: AbilityTarget;
  amount: number;
  actualTarget?: PlayableCard;
  source: PlayableCard;
  targetPlayer: Player;
  
  constructor(abilityData: AbilityAction, playing: Player, opponent: Player) {
    if (!playing.active) {
      throw new Error("no pokemon to attack with");
    }
    
    if (abilityData.target) {
      this.parsedTarget = parseTarget(abilityData.target, playing, opponent);
    }
    this.amount = parseAmount(abilityData, playing, opponent); // do parsing for multiplied amount
    this.source = playing.active;
    this.targetPlayer = opponent;
  }
  
  execute(target?: AbilityTarget) {
    if (Array.isArray(target) || Array.isArray(this.parsedTarget)) {
      throw new Error("Invalid Target, should be single playable card");
    }
    // sort of wonky since target can be provided by front end
    this.actualTarget = target ? target : this.parsedTarget;
    this.actualTarget.damage(this.amount);
    if (this.actualTarget.isDead()) {
      this.targetPlayer.discard(this.actualTarget);
    }    
  }

  toString() {
    if (!this.actualTarget) {
      throw new Error("Ability has not yet been executed");
    }

    return `${this.source.card.name} attacked ${this.actualTarget.card.name} dealing ${this.amount} damage`
  }
}
