import { Template } from 'meteor/templating';
import './LandingLayout.html';
import '../../partials/UploadDeck/UploadDeck.ts';


Template.LandingLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    }
  })