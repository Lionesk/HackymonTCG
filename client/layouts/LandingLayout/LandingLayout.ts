import { Template } from 'meteor/templating';
import './LandingLayout.html';

Template.LandingLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    }
  })