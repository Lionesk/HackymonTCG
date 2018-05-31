import { Mongo } from "meteor/mongo";

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
}

export enum EnergyCat {}

export interface CardSchema {
    type: CardType;
    category: PokemonCat | TrainerCat | EnergyCat;
}

export interface PokemonCard extends CardSchema {
    type: CardType.POKEMON,
    category: PokemonCat,
}

let Cards = new Mongo.Collection<CardSchema>('cards');

export {Cards};
