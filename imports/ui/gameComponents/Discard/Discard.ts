import '../../Card/Card.ts'
import {Template} from 'meteor/templating'

Template.Discard.helpers({
    createPlaceholderCard:function(){
        return {"card":{"name":"deck"}};
    }
})