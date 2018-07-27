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
import swal from 'sweetalert';
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
        let aiDeckElement: HTMLSelectElement | null = document.getElementById("playerDeck") as HTMLSelectElement | null;
        if (!aiDeckElement) {
          throw new Error("aiDeck element does not exist");
        }
        let aiDeckId = aiDeckElement.options[aiDeckElement.selectedIndex].getAttribute("data-deck-id");
        //console.log(playerDeckId);
        
        let ms = new MoveState();
        Session.set("move-state",ms);
        // (TODO) quick fix but this should not use relative element paths (get element by ID instead)
        Meteor.call('newGameStart', (event.currentTarget as any).parentNode.parentNode.parentNode.getElementsByClassName("shuffle-option")[0].checked,playerDeckId,aiDeckId,()=>{
          Meteor.call("mulliganToHandle", function(err?: Error, result?: {data: any}){
            if(result){
              
          var answer = confirm("Mulligan! You want to draw more cards? If no opponents hand reduces.")
          if (answer) {
            Meteor.call("dealAdditionalCards", function(err?: Error, result?: {data: any}){
              if(result){alert(result);}
            })
            alert("Draw card");
          }
          else {
            Meteor.call("reduceHandMulligan", function(err?: Error, result?: {data: any}){
              if(result){
                alert(result);}
            })
            alert("Opponent hand reduces");
          }
            }
          });      
          FlowRouter.go('/play');
         
          
        } );
    },
    'click .dropDecksForUser':function(){
        Meteor.call("dropDecksForUser");
    }
  })