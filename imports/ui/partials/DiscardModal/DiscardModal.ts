import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './DiscardModal.html';
import './DiscardModal.css';
import '../../gameComponents/Card/Card.ts'


Template.DiscardModal.events({
    "click #close-discards":function(){
        let modal = document.getElementById('DiscardModal');
        if(modal){
            modal.style.display = 'none';
        }
    }
})
