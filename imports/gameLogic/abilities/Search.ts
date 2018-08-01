import { ExecutableAbilityAction, AbilityTarget, parseTarget} from "./Ability";
import { Player } from "../Player";
import { AbilityAction, Target, Filter } from "../../api/collections/abilities";
import { PlayableCard } from "../PlayableCard";

function generateFilter(filter: Filter): (t: PlayableCard) => boolean {
  let count = filter.count || 1;
  let conditions: ((t: PlayableCard) => boolean)[] = []
  
  if (filter.type) {
    conditions.push(t =>  t.card.type !== filter.type);
  }
  if (filter.evolution) {
    conditions.push(t => !t.card.evolution);
  }
  if (filter.category) {
    conditions.push(t => t.card.category !== filter.category);
  }
  
  return (t: PlayableCard) => {
    if (!count) {
      return false;
    }
    --count;
    return conditions.reduce((prev, cond) => {
      if (prev) {
        return cond(t);
      }
      return prev;
    }, true);
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
    const targetCheck: AbilityTarget = parseTarget(data.source, playing, opponent);
    if ((targetCheck instanceof PlayableCard)) {
      throw new Error("Search source should be a card collection, not a single card");
    }
    this.filter = generateFilter(data.filter);
    
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
    return "generate a nice message plz :3"
  }
}
