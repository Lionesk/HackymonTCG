import './Options.html'
import './Options.css'
import {Template} from 'meteor/templating'


Template.Options.helpers({
    isEnergySelected:function(){
        if(this.moveState==undefined){
            return false
        }else{
            return this.moveState.selectedEnergyCard != null;
        }
    }
});