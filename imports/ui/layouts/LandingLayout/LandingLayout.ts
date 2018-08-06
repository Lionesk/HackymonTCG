import "jquery"
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
    canResumeGame: function(){
      let state = GameStates.find({ userid: Meteor.userId() }).fetch()[0];
      return (state.ai.deck.length===0 && state.player.deck.length===0);
    }
  })



  Template.LandingLayout.events({
    'click .resumeGame':function(event: JQuery.Event){

      if((event.currentTarget as HTMLElement).getAttribute("disabled")){
        return;
      }
      let ms = new MoveState();
      Session.set("move-state",ms);
      Meteor.call('newGameStart', (document.getElementById("shuffle-option") as HTMLInputElement).checked, () => {
        FlowRouter.go('/play');
      });
    },
      'click .newGame':function(event: JQuery.Event){
        let playerDeckElement: HTMLSelectElement | null = document.getElementById("playerDeck") as HTMLSelectElement | null;
        if (!playerDeckElement) {
          throw new Error("playerDeck element does not exist");
        }
        let playerDeckId = playerDeckElement.options[playerDeckElement.selectedIndex].getAttribute("data-deck-id");
        let aiDeckElement: HTMLSelectElement | null = document.getElementById("aiDeck") as HTMLSelectElement | null;
        if (!aiDeckElement) {
          throw new Error("aiDeck element does not exist");
        }
        let aiDeckId = aiDeckElement.options[aiDeckElement.selectedIndex].getAttribute("data-deck-id");
        //console.log(playerDeckId);
        
        let ms = new MoveState();
        Session.set("move-state",ms);
        // (TODO) quick fix but this should not use relative element paths (get element by ID instead)
      Meteor.call('newGameStart', (event.currentTarget as any).parentNode.parentNode.parentNode.getElementsByClassName("shuffle-option")[0].checked, playerDeckId, aiDeckId, () => {
        FlowRouter.go('/play');
        Meteor.call("mulliganToHandle", function (err?: Error, result?: { data: boolean[] }) {
          let resultArray = [] as any;
          if (result !== undefined) {
            resultArray = result;
          }
          if (resultArray[0]) {
            if (!resultArray[1]) {
              //AI MAKES CHOICE
              let random_boolean = Math.random() >= 0.5;
              if (random_boolean) {
                Meteor.call("dealAdditionalCards", function (err?: Error, result?: { data: any }) {})
              }
              else {
                Meteor.call("reduceHandMulligan", function (err?: Error, result?: { data: any }) {})
              }
            }
            else {
              //HUMAN LOGIC HERE
              let modal = document.getElementById('MulliganModal');
              if(modal){
                  modal.style.display = 'block';
              }
              
            }
          }
        });
      });
    },
    'click .dropDecksForUser':function(){
        Meteor.call("dropDecksForUser");
    },
    //must have deck uploaded to access delete account button
    'click .deleteAccount':function(){
        Meteor.call("dropDecksForUser");
        Meteor.call("deleteGameState");
        Meteor.call("deleteAccount");
    }
  })