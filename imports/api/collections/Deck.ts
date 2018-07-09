import { Mongo } from "meteor/mongo";

export interface Deck{
    userid:string;
    name:string;
    deckcards:number[];
}

let Decks: Mongo.Collection<Deck> = new Mongo.Collection<Deck>('decks');

export { Decks };