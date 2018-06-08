import { Mongo } from "meteor/mongo";
import { Ability } from "./abilities";

export enum CardType {
    POKEMON = "pokemon",
    TRAINER = "trainer",
    ENERGY = "energy",
}

export enum PokemonCat {
    BASIC = "basic",
    PSYCHIC = "psychic",
    FIGHTING = "fighting",
    STAGE_ONE = "stage one",
}

export enum TrainerCat {
    STADIUM = "stadium",
    SUPPORTER = "supporter",
    ITEM = "item",
}

export enum EnergyCat {
    COLORLESS = "colorless",
    WATER = "water",
    LIGHTNING = "lightning",
}

export type CardCategory = PokemonCat | EnergyCat | TrainerCat;

export interface Card {
    type: CardType;
    category: PokemonCat | TrainerCat | EnergyCat;
    name: string;
    abilities?: Ability[];
}

export interface PokemonCard extends Card {
    type: CardType.POKEMON,
    category: PokemonCat,
}

export interface TrainerCard extends Card {
    type: CardType.TRAINER,
    category: TrainerCat,
}

export interface EnergyCard extends Card {
    type: CardType.ENERGY,
    category: EnergyCat,
}

let Cards: Mongo.Collection<Card>;
if(!Cards) {
    Cards = new Mongo.Collection<Card>('cards');
}

export { Cards };