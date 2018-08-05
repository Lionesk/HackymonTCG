import { ExecutableAbilityAction, AbilityTarget, parseTarget } from "./Ability";
import { Player } from "../Player";
import { PlayableCard } from "../PlayableCard";
import { AbilityAction, Status } from "../../api/collections/abilities";

export class ApplyStat implements ExecutableAbilityAction {
  parsedTarget: AbilityTarget;
  actualTarget: AbilityTarget;
  status: Status;
  
  constructor(data: AbilityAction, playing: Player, opponent:  Player) {
    if (!data.target || !data.status) {
      throw new Error("Invalid applystat ability");
    }
    this.status = data.status;
    this.parsedTarget = parseTarget(data.target, playing, opponent)
  }
  
  execute(target?: AbilityTarget, index?: number) {
    this.actualTarget = target || this.parsedTarget;
    if (this.actualTarget instanceof PlayableCard) {
      console.log(this.status)
      if(!this.actualTarget.statuses.find((stat)=>{return stat===this.status})){
      console.log(this.status)
      console.log(this.actualTarget)
        
        this.actualTarget.applyStat(this.status);
      }
    } else {
      throw new Error("cannot apply stat on multiple cards");
    }
  }

  toString() {
    return `${(this.actualTarget as PlayableCard).card.name} was afflicted by ${this.status}`;
  }
}