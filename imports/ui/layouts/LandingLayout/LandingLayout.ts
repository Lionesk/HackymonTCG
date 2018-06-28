import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './LandingLayout.html';
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
    }
  })

  Template.LandingLayout.events({
    'click .goToPlay':function(event){
      // Session.set("shuffle-deck",);
      let ms = new MoveState();
      Session.set("move-state",ms);
      Meteor.call('newGameStart', {shuffle: event.currentTarget.parentNode.getElementsByClassName("shuffle-option")[0].checked},()=>{
        FlowRouter.go('/play');
      });
    }
  })