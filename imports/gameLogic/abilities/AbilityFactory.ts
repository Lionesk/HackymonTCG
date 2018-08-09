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
import { Shuffle } from "./Shuffle";

export function createAbility(abilityData: AbilityAction, playing: Player, opponent: Player): ExecutableAbilityAction {
  switch (abilityData.type) {
    case AbilityType.DAMAGE:
      return new Damage(abilityData, playing, opponent);
    case AbilityType.HEAL:
      return new Heal(abilityData, playing, opponent);
    case AbilityType.CONDITIONAL:
      if (!abilityData.conditional || !abilityData.conditional.true) {
        throw new Error("Invalid conditional ability, missing true")
      }
      return new Conditional(abilityData, playing, opponent, abilityData.conditional.true.map(ab => createAbility(ab, playing, opponent)), abilityData.conditional.false ? abilityData.conditional.false.map(ab => createAbility(ab, playing, opponent)) : undefined);
    case AbilityType.DRAW:
      return new Draw(abilityData, playing);
    case AbilityType.APPLY_STAT:
      return new ApplyStat(abilityData, playing, opponent);
    case AbilityType.SEARCH:
      return new Search(abilityData, playing, opponent);
    case AbilityType.SHUFFLE:
      return new Shuffle(abilityData, playing, opponent);
    default:
      throw new Error(`Unsuported ability type ${abilityData.type}`);
  }
}