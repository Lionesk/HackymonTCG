import { AbilityAction, AbilityType, Choice, Target, Filter, Ability } from "../api/collections/abilities";
import { GameStates, PokemonCat } from "../api/collections";
import { PlayableCard } from "../gameLogic/PlayableCard";
import { Session } from "meteor/session";

export async function executeAbility(ability: Ability, abilityIndex: number, playableCard: PlayableCard) {
    let yourChoice = false;
    let actionIndex = -1;
    if (ability.actions.find((elem: AbilityAction, index: number) => {
        actionIndex = index;
        console.log(elem.choice);
        return (elem.choice !== Choice.OPPONENT
            && elem.choice !== Choice.RANDOM
            && elem.choice !== undefined)
            || elem.type === AbilityType.SEARCH
    }) || (playableCard.card.name==="Zubat")
    ) {
        yourChoice = true;
    }
    console.log("Your choice? " + yourChoice + " index: " + actionIndex);
    if (!yourChoice) {
        let ms = Session.get("move-state");
        if (!ms.selectedEnergyCard && !ms.selectedEvolutionPokemonCard) {
            console.log(" ability: called " + abilityIndex);
            Meteor.call("executeAbility", true, playableCard, abilityIndex)
        }
    } else {
        let gs = await GameStates.find({ "userid": Meteor.userId() }).fetch()[0];
        let choices: any;
        choices = {};
        let action = ability.actions[actionIndex];
        const filter = action.filter ? generateFilter(action.filter) : (card: PlayableCard) => true;

        switch (action.target) {
            case Target.OPPONENT_BENCH:
                choices["aiBench"] = gs.ai.bench.filter(filter);
                break;
            case Target.OPPONENT_DISCARD:
                choices["aiDiscard"] = gs.ai.discardPile.filter(filter);
                break;
            case Target.OPPONENT_DECK:
                choices["aiDeck"] = gs.ai.deck.filter(filter);
                break;
            case Target.YOUR_BENCH:
                choices["bench"] = gs.player.bench.filter(filter);
                break;
            case Target.YOUR_DISCARD:
                choices["discard"] = gs.player.discardPile.filter(filter);
                break;
            case Target.YOUR_DECK:
                choices["deck"] = gs.player.deck.filter(filter);
                break;
            case Target.YOUR_POKEMON:
                choices["bench"] = gs.player.bench.filter(filter);
                choices["active"] = [gs.player.active];
                break;
            case Target.YOUR: 
                    choices["bench"] = gs.player.bench.filter(filter);
                    choices["active"] = [gs.player.active];
                break;
            case Target.THEM:
                choices["aiBench"] = gs.ai.bench.filter(filter);
                choices["aiActive"] = [gs.ai.active];
                break; 
            case Target.YOU:
                choices["bench"] = gs.player.bench.filter(filter);
                choices["active"] = [gs.player.active];
                break;
            case Target.OPPONENT:
                choices["aiBench"] = gs.ai.bench.filter(filter);
                choices["aiActive"] = [gs.ai.active];
                break;
        }
        Session.set("ability", {
            "ability": ability,
            "actionIndex": actionIndex,
            "choices": choices,
            "targets": [],
            "playableCard": playableCard,
        });

        let modal = document.getElementById('ChoiceModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

function generateFilter(filter: Filter, amount?: number): (t: PlayableCard) => boolean {
    let conditions: ((t: PlayableCard) => boolean)[] = []

    if (filter.type) {
        conditions.push(t => t.card.type === filter.type);
    }
    if (filter.evolution) {
        conditions.push(t => !!t.card.evolution);
    }
    if (filter.category) {
        // basic pokemon == non evolution pokemon
        conditions.push(t => (filter.category === PokemonCat.BASIC && !t.card.evolution) || t.card.category === filter.category);
    }

    return (t: PlayableCard) => {
        const result = conditions.reduce((prev, cond) => {
            if (prev) {
                return cond(t);
            }
            return prev;
        }, true);

        return result;
    };
}
