import { ExecutableAbilityAction, AbilityTarget } from "./Ability";
import { GameState } from "../GameState";
import { Player } from "../Player";
import { AbilityAction } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";

export class Draw implements ExecutableAbilityAction {
  amount: number;
  source: PlayableCard[];
  playing: Player;

  
  constructor(data: AbilityAction, playing: Player) {
    if (data.amount === undefined) { //  could be 0
      throw new Error("Cannot draw no amount");
    }
    this.amount = data.amount;
    this.source = playing.deck;
    this.playing = playing;
  }
  
  execute(target?: PlayableCard[], index?: number) {
    this.playing.draw(this.amount);
  }

  toString() {
    return `${this.amount} cards have been drawn`;
  }
}
