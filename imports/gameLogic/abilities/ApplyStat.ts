import { ExecutableAbilityAction, AbilityTarget, parseTarget } from "./Ability";
import { Player } from "../Player";
import { PlayableCard } from "../PlayableCard";
import { AbilityAction, Status } from "../../api/collections/abilities";

export class ApplyStat implements ExecutableAbilityAction {
  parsedTarget: AbilityTarget;
  actualTargets: PlayableCard[];
  status: Status;
  
  constructor(data: AbilityAction, playing: Player, opponent:  Player) {
    if (!data.target || !data.status) {
      throw new Error("Invalid applystat ability");
    }
    this.status = data.status;
    this.parsedTarget = parseTarget(data.target, playing, opponent)
  }
  
  execute(target?: PlayableCard[], index?: number) {
    this.actualTargets = ([] as PlayableCard[]).concat(target || this.parsedTarget);
    this.actualTargets.forEach(actualTarget => {
      console.log(this.status)
      if (!actualTarget.statuses.find((stat) => { return stat === this.status })) {
        console.log(this.status)
        console.log(actualTarget)

        actualTarget.applyStat(this.status);
      }
      
    });
  }

  toString() {
    return `${this.actualTargets.map(card => card.card.name).join(", ")} ${this.actualTargets.length === 1 ? 'was' : 'where'} afflicted by ${this.status}`;
  }
}