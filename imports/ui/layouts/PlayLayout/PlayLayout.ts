import { Template } from 'meteor/templating';
import './PlayLayout.html';
import './PlayLayout.css';
import '../../gameComponents/Board/Board.ts'
import { GameStates } from "../../../api/collections";
import { GameState } from "../../../gameLogic/GameState";
import {MoveState} from "./MoveState";
import {Session} from "meteor/session";
declare let FlowRouter: any;

Template.PlayLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    },
    RedirectToLandingLayout:function(){
        FlowRouter.go('/');
    },
    getGameState:function(){
      return GameStates.find({"userid":Meteor.userId()}).fetch()[0];
    },
    isGameOver: function () {
        let state = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
        return state.winner == undefined ? false : true;
    }
  });

Template.Board.onCreated(function(){
  let ms = new MoveState();
  Session.set("move-state",ms);
});

