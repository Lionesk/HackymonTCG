import { CardType, Cost, EnergyCard } from "../api/collections/Cards";
import { AbilityAction, AbilityType } from "../api/collections/abilities";
import { PlayableCard } from "./PlayableCard";


export interface AbilityExecutor {
  source: PlayableCard;
  ability: AbilityAction;
  selectedTarget?: PlayableCard;
}

export function executeAbility(source: PlayableCard, abilityIndex: number, selectedTarget?: PlayableCard) {
  switch (source.card.type) {
    case CardType.POKEMON:
      if (checkCost(source.card.abilities[abilityIndex].cost, source.currentEnergy as EnergyCard[])) {

      }
      // run ability
    case CardType.TRAINER:
      //run ability
    default:
      throw "Invalid card for ability";

  }
}

function checkCost(abilityCost: Cost, cardEnergy: EnergyCard[]): boolean {
  const AvailableEnergy = cardEnergy.reduce<Cost>((acc, element) => {
    if (acc[element.type]) {
      acc.colorless += 1;
      acc[element.type] += 1
    } else {
      acc.colorless = acc.colorless ? acc.colorless + 1 : 1;
      acc[element.type] = 1;
    }
    
    return acc;
  }, {});

  Object.keys(abilityCost).reduce<boolean>((isCastable, index) => {
    if (isCastable && abilityCost[index] > AvailableEnergy) {
      return false;
    }
    return isCastable;
  }, true);

  return false;
}

function castAbility(ability: AbilityAction, selectedTarget?: PlayableCard) {
  switch (ability.type) {
    case AbilityType.DAMAGE:
      // do damage :) 
      break;
    default:
      console.log(`${ability.type} is not implemented yet`)
  }
}