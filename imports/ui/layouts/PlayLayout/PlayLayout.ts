import { Template } from 'meteor/templating';
import './PlayLayout.html';
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
  })

Template.Board.onCreated(function(){

});

