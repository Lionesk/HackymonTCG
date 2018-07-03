import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './LandingLayout.html';
import './LandingLayout.css';
import '../../partials/UploadDeck/UploadDeck.ts';
import {Decks, Cards, Abilities} from "../../../api/collections";
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

  })



  Template.LandingLayout.events({
    'click .resumeGame':function(event){
      // Session.set("shuffle-deck",event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked);
      // console.log( event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked);
      let ms = new MoveState();
      Session.set("move-state",ms);
      Meteor.call('newGameStart', event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked,()=>{
        FlowRouter.go('/play');
      });
    },
      'click .newGame':function(event){
        // Session.set("shuffle-deck",event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked);
        // console.log( event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked);
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