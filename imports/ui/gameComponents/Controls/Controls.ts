import './Controls.html'
import './Controls.css'
import '../Deck/Deck.ts'
import '../Discard/Discard'
import './Options/Options.ts'
import {Template} from 'meteor/templating'
import {Session} from 'meteor/session'

Template.Controls.helpers({
    getMoveState() {
        return Session.get("move-state");
    },
});