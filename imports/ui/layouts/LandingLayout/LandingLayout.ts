import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './LandingLayout.html';
import './LandingLayout.css';
import '../../partials/Header/Header.ts';
import '../../partials/UploadDeck/UploadDeck.ts';
import '../../partials/loading/loading.ts';
import {Decks, Cards, Abilities, GameStates} from "../../../api/collections";
import {MoveState} from "../PlayLayout/MoveState";
declare let FlowRouter: any;

Template.LandingLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    },
    deckExists:function(){
      return Decks.find({"userid":Meteor.userId()}).fetch()[0] != null;
    },
    cardsExists:function(){
      return Cards.find().fetch()[0] != null;
    },
    abilitiesExists:function(){
      return Abilities.find().fetch()[0] != null;
    },
    getDecks:function(){
      return Decks.find({"userid":Meteor.userId()}).fetch();
    },
    isAdmin:function(){
      //return Meteor.users.find({"userid":Meteor.userId()}).fetch()[0].isAdmin;
      return Meteor.user().username === "admin";
    },
    canResumeGame:function(){
      let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];

      if ((state.ai.deck && state.player.deck)) {
          //Checking if the decks exist as a proxy for whether a game is going on, there is likely a better solution
          return false;
      }else{
        return true;
      }
    }
  })



  Template.LandingLayout.events({
    'click .resumeGame':function(event){

      if(event.currentTarget.getAttribute("disabled")){
        return;
      }
      let ms = new MoveState();
      Session.set("move-state",ms);
      Meteor.call('newGameStart', event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked,()=>{
        FlowRouter.go('/play');
      });
    },
      'click .newGame':function(event){
        let playerDeckElement = document.getElementById("playerDeck");
        let playerDeckId = playerDeckElement.options[playerDeckElement.selectedIndex].getAttribute("data-deck-id");
        let aiDeckElement = document.getElementById("airDeck");
        let aiDeckId = aiDeckElement.options[aiDeckElement.selectedIndex].getAttribute("data-deck-id");
        //console.log(playerDeckId);
        
        let ms = new MoveState();
        Session.set("move-state",ms);
        Meteor.call('newGameStart', event.currentTarget.parentNode.parentNode.parentNode.getElementsByClassName("shuffle-option")[0].checked,playerDeckId,aiDeckId,()=>{
          FlowRouter.go('/play');
        });
    },
    'click .dropDecksForUser':function(){
        Meteor.call("dropDecksForUser");
    }
  })