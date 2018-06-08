import { Template } from 'meteor/templating';
import './PlayLayout.html';

declare let FlowRouter: any;

Template.PlayLayout.helpers({
    IsLoggedIn: function () {
      return Meteor.userId()!=null;
    },
    RedirectToLandingLayout:function(){
        FlowRouter.go('/');
    }
  })