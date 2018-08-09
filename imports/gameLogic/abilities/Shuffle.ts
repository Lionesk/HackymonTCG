import { ExecutableAbilityAction, AbilityTarget, parseTarget, parseAmount } from "./Ability";
import { GameState } from "../GameState";
import { AbilityAction, Target } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";
import { Player } from "../Player";

export class Shuffle implements ExecutableAbilityAction {
  parsedTarget?: Player;
  actualTarget?: Player;

  constructor(data: AbilityAction, playing: Player, opponent: Player) {
    if (data.target===Target.YOUR || data.target===Target.YOUR_DECK ||data.target===Target.YOU  ) {
      this.parsedTarget = playing;
    }else{
      this.parsedTarget = opponent;
    }
  }

  execute() {
    // sort of wonky since target can be provided by front end
    if (this.parsedTarget) {
      this.parsedTarget.shuffle();
      this.actualTarget = this.parsedTarget;
    } else {
      throw new Error("no target for ability");
    }
  }

  toString(): string {
    if (!this.actualTarget) {
      throw new Error("Ability has not yet executed, cannot generate message");
    }
    return `shuffled deck`;
  }
}
