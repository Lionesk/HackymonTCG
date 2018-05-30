import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
    requestPermissions: {},
    requestOfflineToken: {},
    passwordSignupFields:'USERNAME_ONLY'});
