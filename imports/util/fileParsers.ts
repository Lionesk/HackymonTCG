import { Card, CardCategory, CardType } from "../api/collections/Cards";
import { Ability, AbilityAction, AbilityType, Abilities, Target, AbilityFunction, Choice, Status } from "../api/collections/abilities";

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
    let looseAction: Partial<AbilityAction> = {};
    const typeIndex = actionStr.indexOf(':');
    const actionType = actionStr.substr(0, typeIndex);
    if (Object.values(AbilityType).includes(actionType)) {
      looseAction.type = actionType as AbilityType;
    } else {
      throw "invalid ability type"
    }
    switch (looseAction.type) {
      case AbilityType.DAMAGE:
        return parseSingleTarget(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.HEAL:
        return parseSingleTarget(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.DEENERGIZE:
        return parseSingleTarget(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.REENERGIZE:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.REDAMAGE:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.SWAP:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.DESTAT:
        return parseTargetOnly(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.DESTAT:
        return parseTargetOnly(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.APPLY_STAT:
        return parseStatus(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.DRAW:
        return parseDraw(looseAction, actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;
      case AbilityType.SEARCH:
        return parseSearch(looseAction,  actionStr.substr(typeIndex, actionStr.length)) as AbilityAction;

    }
    
    if (looseAction.type) {
      return looseAction as AbilityAction; // ensures that ability is properly typed
    } else {
      throw "woops";
    }
  });
}

function parseSingleTarget(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const tokens: string[] = actionData.split(':');
  if (tokens[1] === "choice") {
    action.choice = tokens[2] as Choice;
    action.target = tokens[3] as Target;
    action = parseAmount(action, tokens[4]); // append amount data
  } else {
    action.target = tokens[1] as Target;
    action = parseAmount(action, tokens[2]);
  }

  return action; // should be a full action at this point
}

function parseTargetOnly(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const tokens: string[] = actionData.split(':');
  if (tokens[1] === "choice") {
    action.choice = tokens[2] as Choice;
    action.target = tokens[3] ? tokens[3] as Target : Target.OPPONENT;
  } else {
    action.target = tokens[1] as Target;
  }

  return action;
}

function parseSource(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const tokens: string[] = actionData.split(':');
  if (tokens[1] === "choice") {
    action.choice = tokens[2] as Choice;
    action.source = tokens[3] ? tokens[3] as Target : Target.OPPONENT;
  } else {
    action.source = tokens[1] as Target;
  }

  return action;
}

function parseSourceTarget(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const destinationIndex = actionData.indexOf("destination");
  const sourceString: string = actionData.substr(0, destinationIndex);
  const targetString: string = actionData.substr(destinationIndex, actionData.length - destinationIndex);

  return parseSource(parseSingleTarget(action, targetString), sourceString);
}

function parseStatus(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const tokens: string[] = actionData.split(':');
  action.status = tokens[1] as Status;
  action.target = Target.OPPONENT_ACTIVE;

  return action;
}

function parseDraw(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const tokens: string[] = actionData.split(':');
  if (tokens.length > 1) {
    action.target = tokens[0] as Target;
    action.amount = parseInt(tokens[1]);
  } else {
    action.amount = parseInt(tokens[0]);
  }
  return action;
}

function parseSearch(action: Partial<AbilityAction>, actionData: string): Partial<AbilityAction> {
  const tokens: string[] = actionData.split(':');
  action.target = tokens[1] as Target;
  let sourceIndex: number = 3;
  if (action.target === Target.YOUR_POKEMON) {
    action.specification = tokens.slice(2, 4).join(':');
    sourceIndex = 6;
  }
  action.source = tokens[sourceIndex] as Target;
  const fileterTokens = tokens.slice(sourceIndex + 1, tokens.length - 1);
  action = parseFilter(action, fileterTokens);

  action.amount = parseInt(tokens.pop());
  
   return action;
}

function parseAmount(action: Partial<AbilityAction>, data: string): Partial<AbilityAction> {
  const multiplierIndex = data.indexOf('*');
  if (multiplierIndex === -1) {
    action.amount = parseInt(data);
  } else {
    const factors = data.split('*');
    let number: string;
    let func: string;
    if (parseInt(factors[0]) !== NaN) {
      number = factors[0];
      func = factors[1];
    } else {
      number = factors[1];
      func = factors[0];
    }
    action.amount = parseInt(number);
    const multiplierInfo = func.split("(");
    action.multiplierFunction = multiplierInfo[0] as AbilityFunction;
    action.multiplierTarget = multiplierInfo[1].substr(0, multiplierInfo[1].length - 1) as Target;
  }

  return action;
}

function parseFilter(action: Partial<AbilityAction>, tokens: string[]): Partial<AbilityAction> {
  action.filter = {};
  switch (tokens[0]) {
    case "cat":
      action.filter.category = tokens[1] as CardCategory;
      break;
    case "top":
      action.filter.top = true;
      action.filter.count = parseInt(tokens[1]);
      break;
    case "evolves-from":
      action.filter.evolution = true;
      action.filter.evolutionTarget = tokens[1] as Target;
      break;
    default:
      action.filter.type = tokens[0] as CardType;
      if (tokens.length > 1) {
        action.filter.category = tokens[2] as CardCategory;
      }
  }

  return action;
}
