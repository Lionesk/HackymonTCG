import { PlayableCard } from "../PlayableCard";
import { AbilityAction, AbilityFunction, Target } from "../../api/collections/abilities";
import { GameState } from "../GameState";

export type AbilityTarget = PlayableCard | PlayableCard[];

export interface ExecutableAbilityAction {
  execute(target?: AbilityTarget, index?: number): void;
}

export function parseAmount(state: GameState, action: AbilityAction): number {
  if (!action.amount) {
    throw new Error("action has no amount");
  }
  if (action.amountFunction) {
    if (!action.amountFunctionTarget) {
      throw new Error("no target for amount function");
    }
    switch (action.amountFunction) {
      case AbilityFunction.COUNT:
        return parseCount(state, action.amountFunctionTarget) * action.amount;
    }
  }

  return action.amount;
}

function parseCount(state: GameState, target: Target) {
  const parsedTarget = parseTarget(state, target);
  return Array.isArray(parsedTarget) ? parsedTarget.length : 1;
}

export function parseTarget(state: GameState, target: Target): PlayableCard | PlayableCard[] {
  switch (target) {
    case Target.OPPONENT_ACTIVE:
      if (!state.ai.active) {
        throw new Error("No active to target");
      }
      return state.ai.active;
    case Target.YOUR_ACTIVE:
    // add specification option
      if (!state.player.active) {
        throw new Error("No active to target");
      }
      return state.player.active;
    case Target.OPPONENT_BENCH:
      return state.ai.bench;
  }
  return "" as any;
}
