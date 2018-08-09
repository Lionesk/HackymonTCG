import {Card, CardType, EnergyCard, EnergyCat, PokemonCat, Status, TrainerCard, PokemonCard} from '../api/collections';

export class PlayableCard<T extends Card = Card> {
    id:number;
    card: T;
    currentDamage:number;
    currentEnergy: PlayableCard<EnergyCard>[];
    statuses: Status[];
    under?: PlayableCard<PokemonCard>

    // return true if damage causes knockout
    damage(amount: number) {
        this.currentDamage += amount;
    }
    
    isDead() {
        return this.currentDamage >= (this.card.healthPoints as number);
    }
    heal(amount: number) {
        this.currentDamage = Math.max(this.currentDamage - amount, 0);
    }

    applyStat(stat: Status) {
        this.statuses.push(stat);
    }

    retreat() {
        this.statuses = []; // remove statuses on retreat
    }

    evolve(evolution: PlayableCard<PokemonCard>) {
        if (this.card.type !== CardType.POKEMON) {
            throw new Error("cannot evolve non pokemon");
        }
        if (evolution.card.evolution === this.card.name) {
            this.under = new PlayableCard<PokemonCard>(this.id, this.card as PokemonCard);
            this.id = evolution.id;
            (this.card as PokemonCard) = evolution.card;
        } else {
            throw new Error("Invalid evolution target");
        }
    }

    addEnergy(energy: PlayableCard<EnergyCard>) {
        if (this.card.type !== CardType.POKEMON) {
            throw new Error("Cannot add energy to non pokemon");
        }
        this.currentEnergy.push(energy);
    }
    
    constructor(id: number, card?: T, playable?: PlayableCard<T>){
        this.id = id;
        this.statuses = [];
        this.currentEnergy = [];
        if(card !== undefined && playable !== undefined) {
            this.currentDamage = 0;
        }
        else if(card !== undefined) {
            if(card.type == CardType.POKEMON){
                this.currentDamage = 0;
            }
            this.card = card;
        }
        else if(playable !== undefined) {
            if(playable.card.type === CardType.POKEMON){
                this.currentEnergy = playable.currentEnergy;
                this.currentDamage = playable.currentDamage;
                if(! this.currentDamage){
                    this.currentDamage=0;
                }
                if(! this.currentEnergy){
                    this.currentEnergy = [];
                }
            }
            else if(playable.card.type === CardType.ENERGY){
                this.card = playable.card;
            }
        }
    }
}