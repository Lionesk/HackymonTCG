import { Card, CardCategory, CardType } from "../api/collections/Cards";
import { Ability, AbilityAction, AbilityType, Abilities, Target, AbilityFunction } from "../api/collections/abilities";

export function parseCardString(data: string): void {
  data.split("\n").forEach((cardStr: string) => {
    const card: Partial<Card> = cardStr.split(":").reduce((acc: Partial<Card>, field: string) => {
      return acc;
    }, {});
  });
}

export function parseAbilityString(data: string): void {
  data.split("\n").forEach((abilityStr: string) => {
    let ctr = 0;
    const nameIndex = abilityStr.indexOf(':');
    const ability: Ability = {
      name: abilityStr.substr(0, nameIndex),
      actions: parseAbility(abilityStr.substr(nameIndex + 1, abilityStr.length - (nameIndex + 1))),
    };

    Abilities.insert(ability); // callback??
  });


}

function parseAbility(abilityStr: string) {
  return abilityStr.split(',').map<AbilityAction>((actionStr: string) => {
    const looseAction: Partial<AbilityAction> = actionStr.split(":").reduce((acc: Partial<AbilityAction>, actionToken: string) => {
      if (!acc.type) {
          if (Object.values(AbilityType).includes(actionToken)) {
            acc.type = actionToken as AbilityType;
          } else {
            throw "bad type";
          }
      } else {
        if (acc.type === AbilityType.CONDITIONAL) {
          // special case for parsing conditionals
        } else if (acc.type === AbilityType.DAMAGE) {
          acc = parseDamage(acc, actionToken);
        } else if (acc.type === AbilityType.ADD) {

        } else if (acc.type === AbilityType.APPLY_STAT) {

        } else if (acc.type === AbilityType.DECK) {

        } else if (acc.type === AbilityType.DEENERGIZE) {

        } else if (acc.type === AbilityType.DESTAT) {

        } else if (acc.type === AbilityType.DRAW) {

        } else if (acc.type === AbilityType.HEAL) {

        } else if (acc.type === AbilityType.REDAMAGE) {

        } else if (acc.type === AbilityType.REENERGIZE) {

        } else if (acc.type === AbilityType.SEARCH) {

        }
      }
      return acc;
    }, {});
    if (looseAction.type) {
      return looseAction as AbilityAction; // ensures that ability is properly typed
    } else {
      throw "woops";
    }
  });
}

function parseDamage(action: Partial<AbilityAction>, token: string): Partial<AbilityAction> {
  if (!action.destination && Object.values(Target).includes(token)) {
    action.destination = token as Target;
  } else if (!action.amount && parseInt(token) !== NaN) {
    action.amount = parseInt(token);
  } else {
    const factors = token.split("*");
    if (parseInt(factors[0]) !== NaN) {
      action.amount = parseInt(factors[0]);
      const multiplierInfo = factors[1].split("(");
      action.multiplierFunction = multiplierInfo[0] as AbilityFunction;
      action.multiplierTarget = multiplierInfo[1].substr(0, multiplierInfo[1].length) as Target;
    } else {
      action.amount = parseInt(factors[1]);
      const multiplierInfo = factors[0].split("(");
      action.multiplierFunction = multiplierInfo[0] as AbilityFunction;
      action.multiplierTarget = multiplierInfo[1].substr(0, multiplierInfo[1].length) as Target;
    }
  }

  return action;
}

function parseAdd(action: Partial<AbilityAction>, token: string): Partial<AbilityAction> {

  return action;
}
  