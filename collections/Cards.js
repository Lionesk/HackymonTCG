import SimpleSchema from 'simpl-schema';

//declare let Cards: any;

Cards = new Mongo.Collection('cards');

Cards.schema = new SimpleSchema({
    test:String,
});