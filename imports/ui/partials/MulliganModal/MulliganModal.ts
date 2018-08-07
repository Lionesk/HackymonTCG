import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './MulliganModal.html';
import './MulliganModal.css';
import '../../gameComponents/Card/Card.ts'


Template.MulliganModal.events({
    "click #gain-extra-card":function(){
        Meteor.call("dealAdditionalCards", function (err?: Error, result?: { data: any }) {})
        let modal = document.getElementById('MulliganModal');
        if(modal){
            modal.style.display = 'none';
        }
    },
    "click #reduce-hand":function(){
        Meteor.call("reduceHandMulligan", function (err?: Error, result?: { data: any }) {})
        let modal = document.getElementById('MulliganModal');
        if(modal){
            modal.style.display = 'none';
        }
    }
})
