import { Template } from 'meteor/templating';
import './LandingLayout.html';
import '../../partials/UploadDeck/UploadDeck.ts';

declare let FlowRouter: any;

Template.LandingLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    }
  })

  Template.LandingLayout.events({
    'click .goToPlay':function(){
      FlowRouter.go('/play');
    }
  })