import { assert } from "chai";
import { GameManager } from './GameManager';
import {Player} from "./Player";
import {PlayableCard} from "./PlayableCard";
import {Cards, CardType, EnergyCard, GameStates} from "../api/collections";



describe('generateDeck', function () {


it('deck should be assigned to a player shuffled', function() {
    
let shuffle=true;

let deck=GameManager.generateDeck([51, 52, 50],shuffle);

 assert.equal(deck.length, 3);
    
      });
 });


describe('generateDeck', function () {


it('deck should be assigned to a player', function() {
    
let shuffle=false;

let deck=GameManager.generateDeck([51, 52, 50],shuffle);

 assert.equal(deck.length, 3);
    
      });
 });



describe('coinFlip', function () {

it('result should be boolean', function() {
    

assert.isBoolean(GameManager.coinFlip());
    
      });
 });






describe('shuffleDeck', function () {


it('deck should be shuffled', function() {
    

let deck=GameManager.generateDeck([51, 52, 50],false);

GameManager.shuffleDeck(deck);

 assert.equal(deck.length, 3);
    
      });
 });



