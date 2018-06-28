import { Mongo } from "meteor/mongo";

export interface Deck{
    userid:string;
    deckcards:number[];
}

let Decks: Mongo.Collection<Deck>;
if(!Decks) {
    Decks = new Mongo.Collection<Deck>('decks');
}

export { Decks };