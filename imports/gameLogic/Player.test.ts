import { Player } from "./Player";
import { GameManager } from './GameManager';
import { PlayableCard } from "./PlayableCard";
import { Cards, CardType, EnergyCard, GameStates, PokemonCard } from "../api/collections";
import { parsePokemon } from '../util/fileParsers';
import { Cost, AbilityReference, EnergyCat } from "../api/collections/Cards";
import { assert } from "chai";

describe('shuffle', function () {
            it('REGRESSION deck should not change in size after shuffling', function () {
               let p = new Player();
               let deck = GameManager.generateDeck([51, 52, 50], false);
               p.deck=deck;
                  
                p.shuffle();
                  assert.equal(deck.length, 3);
            });
      });

      describe('cantDraw', function () {
        it('cant draw from empty deck', function () {
           let p = new Player();
           let deck = GameManager.generateDeck([], false);
           p.deck=deck;
              
            let result = p.cantDraw();
            assert.equal(result, true);
        });
  }); 

  describe('cantDraw', function () {
    it('can draw from a deck with at least 1 card', function () {
       let p = new Player();
       let deck = GameManager.generateDeck([51], false);
       p.deck=deck;
          
        let result = p.cantDraw();
        assert.equal(result, false);
    });
});

describe('noPokemon', function () {
    it('no pokemon in bench detected correctly', function () {
       let p = new Player();
       
        let result = p.noPokemon();
        assert.equal(result, true);
    });
});

describe('noPokemon', function () {
    it('no pokemon in bench detected correctly', function () {
        let p = new Player();
        let deck = GameManager.generateDeck([51, 52, 50], false);
        p.deck=deck;

        p.draw();
        assert.equal(p.deck.length, 2);
        assert.equal(p.hand.length, 1);
    });
});

 

    



