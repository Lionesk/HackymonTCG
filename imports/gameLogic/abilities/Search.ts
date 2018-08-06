import { ExecutableAbilityAction, AbilityTarget, parseTarget} from "./Ability";
import { Player } from "../Player";
import { AbilityAction, Target, Filter } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";
import { PokemonCat } from "../../api/collections";

function generateFilter(filter: Filter, amount?: number): (t: PlayableCard) => boolean {
  let count = amount || 1;
  let conditions: ((t: PlayableCard) => boolean)[] = []
  
  if (filter.type) {
    conditions.push(t =>  t.card.type === filter.type);
  }
  if (filter.evolution) {
    conditions.push(t => !!t.card.evolution);
  }
  if (filter.category) {
    // basic pokemon == non evolution pokemon
    conditions.push(t => (filter.category === PokemonCat.BASIC && !t.card.evolution) || t.card.category === filter.category);
  }
  
  return (t: PlayableCard) => {
    if (!count) {
      return false;
    }
    const result = conditions.reduce((prev, cond) => {
      if (prev) {
        return cond(t);
      }
      return prev;
    }, true);
    if (result) {
      --count;
    }
    return result;
  };
}

// NOTE: search always goes to hand?
export class Search implements ExecutableAbilityAction {
  reciever: Player;
  parsedTarget: PlayableCard[];
  filter: (target: PlayableCard) => boolean;
  
  
  constructor(data: AbilityAction, playing: Player, opponent: Player) {
    if (!data.target || !data.source || !data.filter) {
      throw new Error("invalid search ability");
    }
    // parse target in file parser
    const targetCheck: AbilityTarget = parseTarget(`${data.target}-${data.source}` as Target, playing, opponent);
    if ((targetCheck instanceof PlayableCard)) {
      throw new Error("Search source should be a card collection, not a single card");
    }
    this.parsedTarget = targetCheck;
    this.filter = generateFilter(data.filter, data.amount);
    
    // TODO: wally
    if (data.target === Target.YOUR) {
      this.reciever = playing;
    } else {
      this.reciever = opponent;
    }
  }

  execute(target?: AbilityTarget, index?: number) {
    const cards = this.parsedTarget.filter(this.filter);
    this.reciever.hand = this.reciever.hand.concat(cards);
  }

  toString() {
    return "WOWEE cards may or may not have been find, A quality message sure would be nice :3"
  }
}
