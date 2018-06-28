import { Accounts } from 'meteor/accounts-base';
import './LoginButtons.html'
import './LoginButtons.css'
Accounts.ui.config({
    requestPermissions: {},
    requestOfflineToken: {},
    passwordSignupFields:'USERNAME_ONLY'});

Accounts.onLogin(function() {
    Meteor.call("createNewStateIfNotExisting");
});