import { PlayableCard } from "../PlayableCard";
import { AbilityAction, AbilityFunction, Target } from "../../api/collections/abilities";
import { GameState } from "../GameState";
import { Player } from "../Player";

export type AbilityTarget = PlayableCard | PlayableCard[];

export interface ExecutableAbilityAction {
  execute(target?: AbilityTarget, index?: number): void;
}

export function parseAmount(state: GameState, action: AbilityAction, playing: Player, opponent: Player): number {
  if (!action.amount) {
    throw new Error("action has no amount");
  }
  if (action.amountFunction) {
    if (!action.amountFunctionTarget) {
      throw new Error("no target for amount function");
    }
    switch (action.amountFunction) {
      case AbilityFunction.COUNT:
        return parseCount(state, action.amountFunctionTarget, playing, opponent) * action.amount;
    }
  }

  return action.amount;
}

function parseCount(state: GameState, target: Target, playing: Player, opponent: Player) {
  const parsedTarget = parseTarget(target, playing, opponent);
  return Array.isArray(parsedTarget) ? parsedTarget.length : 1;
}

export function parseTarget(target: Target, playing: Player, opponent: Player): PlayableCard | PlayableCard[] {
  switch (target) {
    case Target.OPPONENT_ACTIVE:
      if (!opponent.active) {
        throw new Error("No active to target");
      }
      return opponent.active;
    case Target.YOUR_ACTIVE:
    // add specification option
      if (!playing.active) {
        throw new Error("No active to target");
      }
      return playing.active;
    case Target.OPPONENT_BENCH:
      return opponent.bench;
    case Target.YOUR_DECK:
      return playing.deck;
    case Target.OPPONENT_DECK:
      return opponent.deck;
  }
  return "" as any;
}
