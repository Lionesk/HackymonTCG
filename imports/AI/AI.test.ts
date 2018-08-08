import { AI } from "./AI";
import { Player } from "../gameLogic/Player";
import { PlayableCard} from "../gameLogic/PlayableCard";
import { Cards, CardType, Decks, EnergyCard, GameStates, AbilityType } from "../api/collections";
import { Deck } from "../api/collections/Deck";
import { assert } from "chai";


describe('findPokemon', function () {
    it('pokemon found in array of Playble cards', function () {
          let card1 = new PlayableCard(20);
          let card2 = new PlayableCard(17);
          
                      
          card1.card = { type: CardType.POKEMON } as any;
          card2.card = { type: CardType.ENERGY } as any;     
                 
          let cards: PlayableCard[]=[];
          cards.push(card1);
          cards.push(card2);

          let result = AI.findPokemon(cards, false) as any;

          assert.equal(result.card.type, CardType.POKEMON);
          

    });
});

describe('findPokemon', function () {
    it('evolution not counted as pokemon', function () {
          let card1 = new PlayableCard(20);
          let card2 = new PlayableCard(17);
          
                      
          card1.card = { type: CardType.POKEMON } as any;
          card2.card = { type: CardType.ENERGY } as any;
          card1.card.evolution="Test_Evolution";    
                 
          let cards: PlayableCard[]=[];
          cards.push(card1);
          cards.push(card2);

          let result = AI.findPokemon(cards, true) as any;

          assert.equal(result, undefined);
          

    });
});

describe('findEnergy', function () {
    it('energy card found in array of Playble cards', function () {
          let card1 = new PlayableCard(20);
          let card2 = new PlayableCard(17);
          
                      
          card1.card = { type: CardType.POKEMON } as any;
          card2.card = { type: CardType.ENERGY } as any;
                            
          let cards: PlayableCard[]=[];
          cards.push(card1);
          cards.push(card2);

          let result = AI.findEnergy(cards) as any;

          assert.equal(result.card.type, CardType.ENERGY);
          

    });
});

describe('findEnergy', function () {
    it('energy is not found as expected', function () {
          let card1 = new PlayableCard(20);
          let card2 = new PlayableCard(17);
          
                      
          card1.card = { type: CardType.POKEMON } as any;
          card2.card = { type: CardType.TRAINER } as any;
                            
          let cards: PlayableCard[]=[];
          cards.push(card1);
          cards.push(card2);

          let result = AI.findEnergy(cards) as any;

          assert.equal(result, undefined);
          

    });
});
