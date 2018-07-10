import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// import {GameManager} from '../../gameLogic/GameManager'
// export let gameManager;
Meteor.startup(() => {
  // code to run on server at startup
  // gameManager = new GameManager();
  //if there is admin, if not, create
  if(!Meteor.users.find({'username': "admin"}).fetch()[0]){
    Accounts.createUser({'username': "admin", 'password': "admin"});
  }
});
