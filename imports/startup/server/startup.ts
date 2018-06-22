import { Meteor } from 'meteor/meteor';
import {GameManager} from '../../gameLogic/GameManager'
export let gameManager;
Meteor.startup(() => {
  // code to run on server at startup
  gameManager = new GameManager();

});
