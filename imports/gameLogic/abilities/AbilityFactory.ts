import { ExecutableAbilityAction } from "./Ability";
import { Damage } from "./Damage";
import { AbilityAction, AbilityType } from "../../api/collections/abilities";
import { GameState } from "../GameState";
import { Heal } from "./Heal";
import { Conditional } from "./Conditional";

export function createAbility(state: GameState, abilityData: AbilityAction): ExecutableAbilityAction {
  switch (abilityData.type) {
    case AbilityType.DAMAGE:
      return new Damage(state, abilityData);
    case AbilityType.HEAL:
      return new Heal(state, abilityData);
    case AbilityType.CONDITIONAL:
      if (!abilityData.conditional || !abilityData.conditional.true) {
        throw new Error("Invalid conditional ability, missing true")
      }
      return new Conditional(state, abilityData, createAbility(state, abilityData.conditional.true), abilityData.conditional.false ? createAbility(state, abilityData.conditional.false) : undefined);
    default:
      throw new Error(`Unsuported ability type ${abilityData.type}`);
  }
}