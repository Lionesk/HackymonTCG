import { AbilityAction, Target, Condition } from "../../api/collections/abilities";
import { ExecutableAbilityAction, AbilityTarget, parseAmount, parseTarget } from "./Ability"
import { GameState } from "../GameState";

function createCondition(state: GameState, condition: Condition) {
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
  
  constructor(state: GameState, data: AbilityAction, positive: ExecutableAbilityAction, negative?: ExecutableAbilityAction) {
    if (!data.conditional || !data.conditional.condition) {
      throw new Error("Invalid conditional AbilityAction");
    }
    this.positive = positive;
    this.negative = negative;
    if (data.target) {
      this.parsedTarget = parseTarget(state, data.target);
    }
    this.cond = data.conditional.condition;
    this.condResult = createCondition(state, data.conditional.condition)();;
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