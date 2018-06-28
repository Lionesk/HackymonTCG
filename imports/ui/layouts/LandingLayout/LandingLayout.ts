import { Template } from 'meteor/templating';
import './LandingLayout.html';
import '../../partials/UploadDeck/UploadDeck.ts';
import {Decks, Cards, Abilities} from "../../../api/collections";
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
    'click .goToPlay':function(){
      FlowRouter.go('/play');
    }
  })