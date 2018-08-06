import { ExecutableAbilityAction } from "./Ability";
import { Damage } from "./Damage";
import { AbilityAction, AbilityType } from "../../api/collections/abilities";
import { GameState } from "../GameState";
import { Heal } from "./Heal";
import { Conditional } from "./Conditional";
import { Player } from "../Player";
import { Draw } from "./Draw";
import { ApplyStat } from "./ApplyStat";
import { Search } from "./Search";

export function createAbility(state: GameState, abilityData: AbilityAction, playing: Player, opponent: Player): ExecutableAbilityAction {
  switch (abilityData.type) {
    case AbilityType.DAMAGE:
      return new Damage(state, abilityData, playing, opponent);
    case AbilityType.HEAL:
      return new Heal(state, abilityData, playing, opponent);
    case AbilityType.CONDITIONAL:
      if (!abilityData.conditional || !abilityData.conditional.true) {
        throw new Error("Invalid conditional ability, missing true")
      }
      return new Conditional(state, abilityData, playing, opponent, createAbility(state, abilityData.conditional.true, playing, opponent), abilityData.conditional.false ? createAbility(state, abilityData.conditional.false, playing, opponent) : undefined);
    case AbilityType.DRAW:
      return new Draw(state, abilityData, playing);
    case AbilityType.APPLY_STAT:
      return new ApplyStat(abilityData, playing, opponent);
    case AbilityType.SEARCH:
      return new Search(abilityData, playing, opponent);
    default:
      throw new Error(`Unsuported ability type ${abilityData.type}`);
  }
}