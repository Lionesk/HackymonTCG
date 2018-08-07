import { assert } from "chai";
import { GameManager } from './GameManager';
import { GameState } from './Gamestate';
import { Player } from "./Player";
import { PlayableCard, CardPosition } from "./PlayableCard";
import { Cards, CardType, EnergyCard, GameStates } from "../api/collections";
import { parsePokemon } from '../util/fileParsers';




/* function fakeGameState(){
      
      let state = new GameStates();
} */

describe('generateDeck', function () {
      it('deck should be assigned to a player shuffled', function () {
            let shuffle = true;
            let deck = GameManager.generateDeck([51, 52, 50], shuffle);
            assert.equal(deck.length, 3);
      });
});

describe('generateDeck', function () {
      it('deck should be assigned to a player', function () {
            let shuffle = false;
            let deck = GameManager.generateDeck([51, 52, 50], shuffle);
            assert.equal(deck.length, 3);
      });
});

describe('coinFlip', function () {
      it('result should be boolean', function () {
            assert.isBoolean(GameManager.coinFlip());
      });
});

describe('shuffleDeck', function () {
      it('deck should be shuffled', function () {
            let deck = GameManager.generateDeck([51, 52, 50], false);
            GameManager.shuffleDeck(deck);
            assert.equal(deck.length, 3);
      });

});

describe('placePrizeCards', function () {
      it('place prize cards', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = PlayableCard.constructor();
            let card2 = PlayableCard.constructor();
            let card3 = PlayableCard.constructor();
            let card4 = PlayableCard.constructor();
            card1.id = 20;
            card2.id = 17;
            card3.id = 34;
            card1.currentPosition = CardPosition.PRIZE;
            card2.currentPosition = CardPosition.PRIZE;
            card3.currentPosition = CardPosition.PRIZE;
            let deck = [card1, card2, card3];
            let prizes: PlayableCard[]=[];
            thePlayer.deck = deck;
            thePlayer.prize = prizes;
            thePlayer.inPlay = [card1,card2,card3,card1,card2,card3];
            thePlayer.deckIndex=0;

            console.log(thePlayer.inPlay);

            GameManager.placePrizeCards(thePlayer);

            assert.equal(thePlayer.deck.length, 0);
            assert.equal(thePlayer.prize[0].id, 34);
            assert.equal(thePlayer.prize[1].id, 17);
            assert.equal(thePlayer.prize[2].id, 20);
      });
});

describe('drawPlayer', function () {
      it('draw cards verify correctness of hand and deck', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = PlayableCard.constructor();
            let card2 = PlayableCard.constructor();
            let card3 = PlayableCard.constructor();
            let card4 = PlayableCard.constructor();
            card1.id = 20;
            card2.id = 17;
            card3.id = 34;
            card4.id = 4;
            card1.currentPosition = CardPosition.PRIZE;
            card2.currentPosition = CardPosition.PRIZE;
            card3.currentPosition = CardPosition.PRIZE;
            let deck = [card4, card1, card2, card3];
            let hands: PlayableCard[]=[];
            thePlayer.deck = deck;
            thePlayer.hand = hands;
            thePlayer.inPlay = [card1,card2,card3,card1,card2,card3];
            thePlayer.deckIndex=0;

            console.log(thePlayer.inPlay);

            GameManager.drawPlayer(thePlayer, 3);

            assert.equal(thePlayer.deck.length, 1);
            assert.equal(thePlayer.hand[0].id, 34);
            assert.equal(thePlayer.hand[1].id, 17);
            assert.equal(thePlayer.hand[2].id, 20);

      });
});

describe('applyDamage', function () {
      it('damage is applied correctly after attack', function () {
            let thePlayer: Player = Player.constructor();
            let opponent: Player = Player.constructor();
            let card1 = PlayableCard.constructor();
            let aCard = parsePokemon(1, "Glameow", CardType.POKEMON, "Glameow:pokemon:cat:basic:cat:colorless:60:retreat:cat:colorless:2:attacks:cat:colorless:1:1,cat:colorless:2:2".split(":"));

            card1.id = 20;
            card1.currentDamage = 5;
            card1.card = aCard;

            let result = GameManager.applyDamage(card1, opponent, 5, thePlayer);

            assert.equal(card1.currentDamage, 10);
            assert.equal(result, true);
      });
});

describe('applyDamage', function () {
      it('damage is not applied if no playable card', function () {
            let thePlayer: Player = Player.constructor();
            let opponent: Player = Player.constructor();
            let result = GameManager.applyDamage(PlayableCard.constructor(),opponent, 5, thePlayer);

            assert.equal(result, false);
      });
});

describe('applyDamage', function () {
      it('damage is not applied if playable card does not actually contain a card', function () {
            let thePlayer: Player = Player.constructor();
            let opponent: Player = Player.constructor();
            let card1 = PlayableCard.constructor();

            card1.id = 20;
            card1.currentDamage = 5;

            let result = GameManager.applyDamage(card1, opponent, 5, thePlayer);

            assert.equal(result, false);
      });
});


describe('resolveMulligan', function () {
      it('REGRESSION one mulligan resolved hand should have 7 cards', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
            let card3 = new PlayableCard(34);
            
            card1.card = { type: CardType.POKEMON } as any;
            card2.card = { type: CardType.POKEMON } as any;
            card3.card = { type: CardType.POKEMON } as any;
                        
            let hands: PlayableCard[]=[];
            thePlayer.deck=[card1];
            thePlayer.hand = [card1,card2,card3,card1,card2,card3, card3];
            
            GameManager.resolveMulligan(thePlayer, "test");

            assert.equal(thePlayer.hand.length, 7);
            

      });
});


describe('returnHandToDeck', function () {
      it('REGRESSION hand must be 0 after returning hand to deck', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
            let card3 = new PlayableCard(34);
            
            card1.card = { type: CardType.POKEMON } as any;
            card2.card = { type: CardType.POKEMON } as any;
            card3.card = { type: CardType.POKEMON } as any;
                        
            let hands: PlayableCard[]=[];
            thePlayer.deck=[card1];
            thePlayer.hand = [card1,card2,card3,card1,card2,card3, card3];
            
            GameManager.returnHandToDeck(thePlayer);

            assert.equal(thePlayer.hand.length, 0);
            

      });
});

describe('mulligan', function () {
      it('no pokemon in hand should lead to mulligun', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
            let card3 = new PlayableCard(34);
            
            card1.card = { type: CardType.TRAINER } as any;
            card2.card = { type: CardType.ENERGY } as any;
            card3.card = { type: CardType.TRAINER } as any;
                        
            let hands: PlayableCard[]=[];
            thePlayer.deck=[card1];
            thePlayer.hand = [card1,card2,card3,card1,card2,card3, card3];
            
            let result=GameManager.mulligan(7, thePlayer);

            assert.equal(result, true);
            

      });
});

describe('mulligan', function () {
      it('at least one pokemon in hand is enough to avoid mulligan', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
            let card3 = new PlayableCard(34);
            
            card1.card = { type: CardType.POKEMON } as any;
            card2.card = { type: CardType.ENERGY } as any;
            card3.card = { type: CardType.TRAINER } as any;
                        
            let hands: PlayableCard[]=[];
            thePlayer.deck=[card1];
            thePlayer.hand = [card1,card2,card3,card2,card2,card3, card3];
            
            let result=GameManager.mulligan(7, thePlayer);

            assert.equal(result, false);
            

      });
});

describe('mulligan', function () {
      it('REGRESSION evolution is not considered to be playable card for mulligan determination', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
            let card3 = new PlayableCard(34);
            
            card1.card = { type: CardType.POKEMON } as any;
            card2.card = { type: CardType.ENERGY } as any;
            card3.card = { type: CardType.TRAINER } as any;
            card1.card.evolution="TEST_EVOLUTION";
                        
            let hands: PlayableCard[]=[];
            thePlayer.deck=[card1];
            thePlayer.hand = [card1,card2,card3,card2,card2,card3, card3];
            
            let result=GameManager.mulligan(7, thePlayer);

            assert.equal(result, true);
            

      });
});

describe('addEnergyToCard', function () {
      it('card is added to energyCard array', function () {
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
                        
            card1.card = { type: CardType.POKEMON } as any;
            card2.card = { type: CardType.ENERGY } as any;     
                       
            GameManager.addEnergyToCard(card1, card2);

            assert.equal(card1.currentEnergy[0].type, CardType.ENERGY);
            

      });
});

describe('noPokemonInDeck', function () {
      it('correctly determines if there is not a single pokemon in entire deck', function () {
            let thePlayer: Player = Player.constructor();
            let card1 = new PlayableCard(20);
            let card2 = new PlayableCard(17);
                        
            card1.card = { type: CardType.ENERGY } as any;
            card2.card = { type: CardType.ENERGY } as any;
            let deck: PlayableCard[]=[];
            thePlayer.deck=deck;
                        
            for(let i=0; i<52; i++){
                  if(i%2 === 0)
                  thePlayer.deck.push(card1);
                  else{
                        thePlayer.deck.push(card2);
                  }
            }
          
            let result=GameManager.noPokemonInDeck(thePlayer);
            assert.equal(result, true);
            });
});










