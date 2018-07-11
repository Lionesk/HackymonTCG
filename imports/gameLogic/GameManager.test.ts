import { assert } from "chai";
import { GameManager } from './GameManager';
import { Player } from "./Player";
import { PlayableCard } from "./PlayableCard";
import { Cards, CardType, EnergyCard, GameStates } from "../api/collections";
import { parsePokemon } from '../util/fileParsers';



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
            card1.id = 20;
            card2.id = 17;
            card3.id = 34;
            let deck = [card1, card2, card3];
            let prizes = [];
            thePlayer.deck = deck;
            thePlayer.prize = prizes;

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
            card1.id = 20;
            card2.id = 17;
            card3.id = 34;
            let deck = [card1, card2, card3];
            let hands = [];
            thePlayer.deck = deck;
            thePlayer.hand = hands;

            GameManager.drawPlayer(thePlayer, 3);

            assert.equal(thePlayer.deck.length, 0);
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
            let result = GameManager.applyDamage(null, opponent, 5, thePlayer);

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
