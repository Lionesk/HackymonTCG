import {PlayableCard} from './PlayableCard';
import { PokemonCard, Card, CardType, Target } from '../api/collections';

export class Player{

    id: string;
    active?: PlayableCard<PokemonCard>;    
    bench: PlayableCard<PokemonCard>[];
    hand: PlayableCard<Card>[];
    prize: PlayableCard<Card>[];
    deck: PlayableCard<Card>[];
    discardPile: PlayableCard<Card>[];

    // check all win conditions
    outOfPrize(): boolean {
        return this.prize.length === 0;
    }
    
    // check all lose conditions
    cantDraw(): boolean {
        return this.deck.length === 0;
    }

    noPokemon(): boolean {
        return this.bench.length === 0 && !this.active;
    }
    
    constructor(player?: Player){
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.deck = [];
        this.hand = [];
        this.bench = [];
        this.prize = [];
        this.discardPile = [];
    }

    draw(amount: number = 1) {
        if (this.deck.length > amount) {
            this.hand = this.hand.concat(this.deck.slice(0, amount));
            this.deck = this.deck.slice(amount);
        } else {
            this.hand = this.hand.concat(this.deck);
            this.deck = [];
        }
    }

    /**
     *
     *
     * @returns the numer of cards discarded
     * @memberof Player
     */
    discardDead() {
        let discardCount = 0;
        if (this.active && this.active.isDead()) {
            this.discard(this.active);
            discardCount += 1;
        }
        // filter first since this alters the bench
        const benchDead = this.bench.filter(card => card.isDead());
        discardCount += benchDead.length;
        benchDead.forEach(card => this.discard(card));

        return discardCount;
    }

    collectPrizeCard(amount: number = 1) {
        if (amount <= this.prize.length) {
            this.hand = this.hand.concat(this.prize.slice(0, amount));
            this.prize = this.prize.slice(amount);
        } else {
            this.hand = this.prize.concat(this.prize);
            this.prize = [];
        }
    }
    
    updateTarget(target: Target, value: PlayableCard | PlayableCard[]) {
        switch(target) {
            case Target.OPPONENT_DECK:
            case Target.YOUR_DECK:
                if (!Array.isArray(value)) {
                    throw new Error("Invalid value for target");   
                }
                this.deck = value;
                break;
            case Target.OPPONENT_DECK:
            case Target.YOUR_DISCARD:
            if (!Array.isArray(value)) {
                throw new Error("Invalid value for target");   
            }
            this.discardPile = value;
            break;
            default:
                console.error("Invalid target type on player");
        }
    }

    discard(card: PlayableCard<Card>) {
        const toDiscard: PlayableCard<Card>[] = [];
        switch (card.card.type) {
            case CardType.POKEMON:
                for (let energy of card.currentEnergy) {
                    toDiscard.push(energy);
                }
                if (card.under) {
                    toDiscard.push(card.under);
                    card.under = undefined;
                }
                card.currentEnergy = [];
                toDiscard.push(card);
                if (card === this.active) {
                    this.active = undefined;
                }
                else if (this.bench.find((element) => element.id === card.id)) {
                    this.bench = this.bench.filter(c => c !== card);
                }
                break;
            case CardType.TRAINER:
                toDiscard.push(card);
                this.hand = this.hand.filter(c => c !== card);
                break;
            default:
                throw new Error("Invalid card");
        }
        this.discardPile = this.discardPile.concat(toDiscard);
    }
}