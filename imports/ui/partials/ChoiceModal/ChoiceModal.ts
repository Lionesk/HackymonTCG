import { Template } from 'meteor/templating';
import './ChoiceModal.html';
import './ChoiceModal.css';
import '../../gameComponents/Card/Card.ts'
Template.ChoiceModal.events({
   "click #cancelTarget":function(){
        let modal = document.getElementById('ChoiceModal');
        if(modal){
            console.log("modal2")
            modal.style.display = 'none';
        }
    }
})