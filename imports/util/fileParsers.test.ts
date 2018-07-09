
import { assert } from "chai";
import { parseCardString, parseAbilityString, parsePokemon, parseTrainer, parseEnergy, parseAbility, parseDeckFile } from './fileParsers';




import {
  Card,
  Cards,
  CardCategory,
  CardType,
  PokemonCard,
  PokemonCat,
  Cost,
  AbilityReference,
  TrainerCard,
  TrainerCat,
  EnergyCard,
  EnergyCat
} from "../api/collections/Cards";
import {
  Ability,
  AbilityAction,
  AbilityType,
  Abilities,
  Target,
  AbilityFunction,
  Choice,
  Status,
  Condition
} from "../api/collections/abilities";

import{  
  Decks
} from "../api/collections/Deck";

describe('parseCardString', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
	});

     it('card should be inserted into the db', function() {
    
   parseCardString("Glameow:pokemon:cat:basic:cat:colorless:60:retreat:cat:colorless:2:attacks:cat:colorless:1:1,cat:colorless:2:2");

   let aCard=Cards.find().fetch()[0];

   assert.equal(aCard.name, "Glameow");
   assert.equal(aCard.type, "pokemon");
   assert.equal(aCard.healthPoints, 60);
   assert.equal(aCard.index, 1);
   assert.equal(aCard.category, "colorless");

   let abilities=aCard.abilities.length;

   assert.isTrue(abilities>0 );


    
      });
 });



 describe('parsePokemon', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
	});

     it('pokemon card should be parsed', function() {
    
   let aCard=parsePokemon(1,"Glameow", CardType.POKEMON, "Glameow:pokemon:cat:basic:cat:colorless:60:retreat:cat:colorless:2:attacks:cat:colorless:1:1,cat:colorless:2:2".split(":"));

   
  assert.equal(aCard.name, "Glameow");
   assert.equal(aCard.type, "pokemon");
   assert.equal(aCard.healthPoints, 60);
   assert.equal(aCard.index, 1);
   assert.equal(aCard.category, "colorless");

   let abilities=aCard.abilities.length;

   assert.isTrue(abilities>0 );


    
      });
 });



 describe('parseTrainer', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
	});

     it('trainer card should be parsed', function() {
    


   let aCard=parseTrainer(1,"Tierno", CardType.TRAINER, "Tierno:trainer:cat:supporter:31".split(":"));

   
  assert.equal(aCard.name, "Tierno");
   assert.equal(aCard.type, "trainer");
 
   assert.equal(aCard.index, 1);
   assert.equal(aCard.category, "supporter");

   let abilities=aCard.abilities.length;

   assert.isTrue(abilities>0 );


    
      });
 });


 describe('parseEnergy', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
	});

     it('Energy card should be parsed', function() {
    


   let aCard=parseEnergy(1,"Lightning", CardType.ENERGY, "Lightning:energy:cat:lightning".split(":"));

   
  assert.equal(aCard.name, "Lightning");
   assert.equal(aCard.type, "energy");
 
   assert.equal(aCard.index, 1);
   assert.equal(aCard.category, "lightning");



    
      });
 });


 describe('parseAbilityString', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
	});

     it('abilities should be inserted into the db', function() {
    
   parseAbilityString("Nyan Press:dam:target:opponent-active:40,cond:flip:dam:target:opponent-active:40:else:applystat:status:paralyzed:opponent-active");

   let ability=Abilities.find().fetch()[0];

   assert.equal(ability.name, "Nyan Press");
  assert.equal(ability.index, 1);

let actions=ability.actions.length;

   assert.isTrue(actions>0 );
    
      });
 });


 
describe('parseDeckFile', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
		Decks.remove({"userid":"test"});
	});

     it('deck should be inserted into the db', function() {
    
let data="25\n51\n50";
let name="testDeck";
let id="test";

   parseDeckFile(data, name ,id);

   let deck=Decks.find({"userid":id, "name":name}).fetch()[0];

  assert.equal(deck.deckcards[0], 25);
  
    
      });
 });



describe('parseAbility', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
		Decks.remove({"userid":"test"});
	});

     it('ability should be parsed (Damage type)', function() {
    

   let result=parseAbility("dam:target:opponent-active:20");

  assert.equal(result[0].type, AbilityType.DAMAGE);
      
      });
 });

describe('parseAbility', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
		Decks.remove({"userid":"test"});
	});

     it('ability should be parsed (heal type)', function() {
    

   let result=parseAbility("heal:target:choice:your:30");

  assert.equal(result[0].type, AbilityType.HEAL);
      
      });
 });

describe('parseAbility', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
		Decks.remove({"userid":"test"});
	});

     it('ability should be parsed (redamage type)', function() {
    

  let result=parseAbility("redamage:source:choice:opponent:destination:opponent:count(target:last:source:damage");

  assert.equal(result[0].type, AbilityType.REDAMAGE);
      
      });
 });

 describe('parseAbility', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
		Decks.remove({"userid":"test"});
	});

     it('ability should be parsed (reenergize type)', function() {
    

  let result=parseAbility("reenergize:target:choice:your:1:target:choice:your:1");

  assert.equal(result[0].type, AbilityType.REENERGIZE);
      
      });
 });

 describe('parseAbility', function () {
	beforeEach(() => {
		Cards.remove({});
		Abilities.remove({});
		Decks.remove({"userid":"test"});
	});

     it('ability should be parsed (applystat type)', function() {
    

  let result=parseAbility("applystat:status:asleep:opponent-active");

  assert.equal(result[0].type, AbilityType.APPLY_STAT);
      
      });
 });

