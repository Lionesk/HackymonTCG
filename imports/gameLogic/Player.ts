import {PlayableCard} from './PlayableCard';
import {GameManager} from "./GameManager";
import { PokemonCard, Card, CardType } from '../api/collections';

export class Player{

    id: string;
    active?: PlayableCard<PokemonCard>;    
    bench: PlayableCard<PokemonCard>[];
    hand: PlayableCard<Card>[];
    prize: PlayableCard<Card>[];
    deck: PlayableCard<Card>[];
    discardPile: PlayableCard<Card>[];

    constructor(player?: Player){
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.deck = [];
        this.hand = [];
        this.bench = [];
        this.prize = [];
        this.discardPile = [];
    }

    draw(amount: number = 1) {
        if (this.deck.length < amount) {
            return GameManager.setLoser(this);
        }
        this.hand = this.hand.concat(this.deck.slice(0, amount));
        this.deck = this.deck.slice(amount);
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