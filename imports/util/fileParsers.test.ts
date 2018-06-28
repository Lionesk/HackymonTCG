
import { assert } from "chai";
import { parseCardString, parseAbilityString, parsePokemon, parseTrainer, parseEnergy, parseAbility } from './fileParsers';




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


 



 