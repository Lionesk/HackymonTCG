import {PlayableCard} from './PlayableCard';
import { PokemonCard, Card, CardType } from '../api/collections';

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
        console.log(this.prize.length);
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

    discard(card: PlayableCard<Card>) {
        const toDiscard: PlayableCard<Card>[] = [];
        switch (card.card.type) {
            case CardType.POKEMON:
                toDiscard.push(card);
                for (let energy of card.currentEnergy) {
                    toDiscard.push(energy);
                }
                if (card === this.active) {
                    toDiscard.push(this.active);
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