export interface CardSchema {
    banana: string;
}

let Cards = new Mongo.Collection<CardSchema>('cards');

export {Cards};
