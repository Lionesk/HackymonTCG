import './Deck.html'
import './Deck.css'
import '../Card/Card.ts'
import {Template} from 'meteor/templating'

Template.Deck.helpers({
    createPlaceholderCard:function(){
        return {"card":{"name":"deck"}};
    }
})