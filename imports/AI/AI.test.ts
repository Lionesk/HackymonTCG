import { assert } from "chai";
import { stub } from 'sinon';
import StubCollections from 'meteor/hwillson:stub-collections';
import {GameState} from "../gameLogic/GameState";
import {PlayableCard} from "../gameLogic/PlayableCard";
import {Cards, GameStates, GameStates} from "../api/collections";
import {AI} from "./AI";
import {GameManager} from "../gameLogic/GameManager";

//TODO: Figure out how to stub out all this crap so that I can run the tests

describe('placeActive', function () {
   it('Should select a benched pokemon before hand pokemon', function () {
       let testState = new GameState('123456');
       GameStates.insert(testState);
       testState.ai.active = undefined;
       testState.ai.hand = [];
       testState.ai.bench = [];
       testState.ai.hand = [];
       let cardCounter = 0;
       stub(Meteor, 'userId').returns('123456');
       stub(GameManager, 'draw').returns({});
       testState.ai.hand.push(new PlayableCard(cardCounter++, Cards.find({"index":5}).fetch()[0]));
       testState.ai.bench.push(new PlayableCard(cardCounter++, Cards.find({"index":2}).fetch()[0]));
       AI.playTurnFromState(testState);
       assert.equal(testState.ai.bench.length, 0);
       assert.equal(testState.ai.hand.length, 1);
       testState.ai.active = undefined;
       AI.playTurnFromState(testState);
       assert.equal(testState.ai.hand.length, 0);
   })
});