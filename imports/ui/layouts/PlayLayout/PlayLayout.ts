import { Template } from 'meteor/templating';
import './PlayLayout.html';
import '../../gameComponents/Board/Board.ts'
import { GameStates } from "../../../api/collections";
import { GameState } from "../../../gameLogic/GameState";

declare let FlowRouter: any;

Template.PlayLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    },
    RedirectToLandingLayout:function(){
        FlowRouter.go('/');
    },
    getGameState:function(){
      // console.log("game berfore return "+ GameStates.find({"userid":Meteor.userId()}).fetch()[0])
      return GameStates.find({"userid":Meteor.userId()}).fetch()[0];
    },
  })

