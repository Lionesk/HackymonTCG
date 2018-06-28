import {
  Card,
  Cards,
  CardCategory,
  CardType,
  PokemonCard,
  PokemonCat,
  Cost,
  AbilityReference,
  TrainerCard,
  TrainerCat,
  EnergyCard,
  EnergyCat
} from "../api/collections/Cards";
import {
  Ability,
  AbilityAction,
  AbilityType,
  Abilities,
  Target,
  AbilityFunction,
  Choice,
  Status,
  Condition
} from "../api/collections/abilities";

import{  
  Decks
} from "../api/collections/Deck";

export function parseCardString(data: string): void {
  Cards.remove({}); // drop all cards
  
  data.replace("#\n", "");
  let ctr = 1;
  data.split("\n").forEach((cardStr: string) => {
    const tokens: string[] = cardStr.split(':');
    const name: string = tokens[0];
    const type: CardType = tokens[1] as CardType;
    let card: Card;
    switch (type) {
      case CardType.POKEMON:
        card = parsePokemon(ctr++, name, type, tokens);
        break;
      case CardType.TRAINER:
        card = parseTrainer(ctr++, name, type, tokens);
        break;
      case CardType.ENERGY:
        card = parseEnergy(ctr++, name, type, tokens);
        break;
    }

    console.log(card);
    if (card) {
      Cards.insert(card);
    }
  });
}

export function parsePokemon(index: number, name: string, type: CardType, tokens: string[]): PokemonCard {
  if (type === CardType.POKEMON) {
    let category: PokemonCat;
    let healthPoints: number;
    let evolution: string;
    if (tokens[3] === PokemonCat.STAGE_ONE) {
      evolution = tokens[4];
      category = tokens[6] as PokemonCat;
      healthPoints = parseInt(tokens[7]);
    } else {
      category = tokens[5] as PokemonCat;
      healthPoints = parseInt(tokens[6]);
    }

    const retreatCost: Cost = {};
    const retreatTokens: string[] = tokens.slice(tokens.indexOf("retreat") + 1, tokens.indexOf("attacks"));
    for (let i = 0; i < retreatTokens.length; i += 3) {
      retreatCost[retreatTokens[i + 1]] = retreatTokens[i + 2]
    }

    let costAcc: Cost = {};
    
    let abilities: AbilityReference[] = tokens.slice(tokens.indexOf("attacks") + 1).join(":").split(",").map((abilityString: string) => {
      const abilityTokens = abilityString.split(":");
      costAcc[abilityTokens[1]] = parseInt(abilityTokens[2]);
      if (abilityTokens.length === 4) {
        const ability: AbilityReference =  {
          index: parseInt(abilityTokens[3]),
          cost: costAcc,
        }
        costAcc = {};

        return ability
      }
    });
    // remove undefined entries
    let abilityIndex = 0;
    abilities = abilities.reduce((acc: AbilityReference[], val: AbilityReference | undefined) => {
      if (val) {
        acc[abilityIndex++] = val;
      }

      return acc;
    }, [])

    return {
      index,
      name,
      type,
      category,
      healthPoints,
      abilities,
      retreatCost,
      evolution,
    }
  } else {
    throw "invalid card type"
  }
}

export function parseTrainer(index: number,name: string, type: CardType, tokens: string[]): TrainerCard {
  if (type === CardType.TRAINER) {

    return {
      index,
      name,
      type,
      category: tokens[3] as TrainerCat,
      abilities: [{
        index: parseInt(tokens[4]),
      }],
    };
  } else {
    throw "invalid card type";
  }
}

export function parseEnergy(index: number,name: string, type: CardType, tokens: string[]): EnergyCard {
  if (type === CardType.ENERGY) {
    return {
      index,
      name,
      type,
      category: tokens[3] as EnergyCat,
    }
  } else {
    throw "invalid card type"
  }
  
}

export function parseAbilityString(data: string): void {
  Abilities.remove({});
  
  let ctr = 1;
  data.split("\n").forEach((abilityStr: string) => {
    const nameIndex = abilityStr.indexOf(':');
    const ability: Ability = {
      index: ctr++,
      name: abilityStr.substr(0, nameIndex),
      actions: parseAbility(abilityStr.substr(nameIndex + 1, abilityStr.length - (nameIndex + 1))),
    };

    // Abilities.insert(ability); // callback??
    console.log(ability);
    Abilities.insert(ability);
  });


}

export function parseAbility(abilityStr: string) {
  // cannot split on comma only first comma must be taken into account so use substring
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
        return parseSingleTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.HEAL:
        return parseSingleTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.DEENERGIZE:
        return parseSingleTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.REENERGIZE:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.REDAMAGE:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.SWAP:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.DESTAT:
        return parseTargetOnly(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.DESTAT:
        return parseTargetOnly(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.APPLY_STAT:
        return parseStatus(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.DRAW:
        return parseDraw(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.SEARCH:
        return parseSearch(looseAction,  actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.DECK:
        return parseSourceTarget(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.SHUFFLE:
        return parseTargetOnly(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
      case AbilityType.CONDITIONAL:
        return parseCondition(looseAction, actionStr.substr(typeIndex + 1, actionStr.length)) as AbilityAction;
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
    action.target = tokens.length === 5 ? tokens[3] as Target : tokens[2] as Target;
    action = parseAmount(action, tokens.slice(tokens.length === 5? 4 : 3, tokens.length).join(":")); // append amount data
  } else {
    action.target = tokens[1] as Target;
    action = parseAmount(action, tokens.slice(2, tokens.length).join(":"));
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
    if (!isNaN(parseInt(factors[0]))) {
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

function parseCondition(action: Partial<AbilityAction>, data: string): Partial<AbilityAction> {
  const tokens: string[] = data.split(":");
  action.conditional = {};
  action.conditional.condition = tokens[0] as Condition;
  switch (action.conditional.condition) {
    case Condition.ABILITY:
      action.conditional.conditionAbility = parseAbility(data.substr(data.indexOf(tokens[1]), data.indexOf(":(") - data.indexOf(tokens[2])))[0];
      action.conditional.true = parseAbility(data.substr(data.indexOf("(") + 1, data.length - data.indexOf("(")))[0];
      break;
    case Condition.FLIP:
      if (data.indexOf("|") === -1) {
        action.conditional.true = parseAbility(data.substr(data.indexOf(tokens[1]), data.length - data.indexOf(tokens[1])))[0];
      } else {
        action.conditional.true = parseAbility(data.substr(data.indexOf("(") + 1, data.indexOf("|") - data.indexOf("(")))[0];
        action.conditional.false = parseAbility(data.substr(data.indexOf("|") + 1, data.indexOf(")") - data.indexOf("|")))[0];
      }
      break;
    case Condition.HEAL:
      action.conditional.healTarget = tokens[2] as Target;
      if (data.indexOf("|") === -1) {
        action.conditional.true = parseAbility(data.substr(data.indexOf(tokens[1]), data.length - data.indexOf(tokens[1])))[0];
      } else {
        action.conditional.true = parseAbility(data.substr(data.indexOf("(") + 1, data.indexOf("|") - data.indexOf("(")))[0];
        action.conditional.false = parseAbility(data.substr(data.indexOf("|") + 1, data.indexOf(")") - data.indexOf("|")))[0];
      }
      break;
    case Condition.CHOICE:
      if (data.indexOf("|") === -1) {
        action.conditional.true = parseAbility(data.substr(data.indexOf(tokens[1]), data.length - data.indexOf(tokens[1])))[0];
      } else {
        action.conditional.true = parseAbility(data.substr(data.indexOf("(") + 1, data.indexOf("|") - data.indexOf("(")))[0];
        action.conditional.false = parseAbility(data.substr(data.indexOf("|") + 1, data.indexOf(")") - data.indexOf("|")))[0];
      }
  }

  return action;
}

function parseDeck(action: Partial<AbilityAction>, data: string): Partial<AbilityAction> {
  return action;
}

export function parseDeckFile(data: string){
  let deckcardsString = data.split("\n");
  let deckcards = [];
  deckcardsString.forEach((cardString)=>{
    deckcards.push(parseInt(cardString));
  });
  Decks.remove({});
  Decks.insert({"userid":Meteor.userId(),"deckcards":deckcards})
}
