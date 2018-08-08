import { AbilityAction, Condition } from "../../api/collections/abilities";
import { ExecutableAbilityAction, AbilityTarget, parseTarget } from "./Ability"
import { GameState } from "../GameState";
import { Player } from "../Player";

function createCondition(condition: Condition) {
  switch (condition) {
    case Condition.FLIP:
      return () => !!Math.round(Math.random());
    default:
      throw new Error(`Invalid condition ${condition}`);
  }
}

function createConditionString(condition: Condition, conditionResult: boolean): string {
  switch (condition) {
    case Condition.FLIP:
      return `The coin flip resulted in ${conditionResult ? "heads" : "tails"}`;
    default:
      return "UNSUPORTED CONDITIONAL";
  }
}

export class Conditional implements ExecutableAbilityAction {
  parsedTarget?: AbilityTarget;
  positive: ExecutableAbilityAction;
  negative?: ExecutableAbilityAction;
  cond: Condition;
  condResult: boolean;
  
  constructor(data: AbilityAction, playing: Player, opponent: Player, positive: ExecutableAbilityAction, negative?: ExecutableAbilityAction) {
    if (!data.conditional || !data.conditional.condition) {
      throw new Error("Invalid conditional AbilityAction");
    }
    this.positive = positive;
    this.negative = negative;
    if (data.target) {
      this.parsedTarget = parseTarget(data.target, playing, opponent);
    }
    this.cond = data.conditional.condition;
    this.condResult = createCondition(data.conditional.condition)();;
  }

  execute(target?: AbilityTarget) {
    if (this.condResult) {
      this.positive.execute(target);
    } else if (this.negative) {
      this.negative.execute(target);
    }
  }

  toString() {
    return `${createConditionString(this.cond, this.condResult)} thus, ${this.condResult ? this.positive.toString() : (this.negative ? this.negative.toString() : "nothing happened")}`;
  }
}