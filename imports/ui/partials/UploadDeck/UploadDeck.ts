import { Template } from 'meteor/templating'
import './UploadDeck.html'
import { Cards, CardType, TrainerCat } from "../../../api/collections";

enum UploadTypes {
    CARDS = "cards",
    DECK = "deck",
    ABIL = "abilities"
}

const UploadMap: { [key in UploadTypes]: (string) => void } = {
    cards: data => Meteor.call("uploadCards", { cardString: data }),
    deck: data => Meteor.call("uploadDeck", { cardString: data }),
    abilities: data => Meteor.call("uploadAbilities", { cardString: data }),
}

Template.UploadDeck.events({
    'dragover .uploadDropper'(e, t) {
        e.preventDefault();
      },
      'dragenter .uploadDropper'(e, t) {
        e.preventDefault();
        // change style of drop zone
      },
    async 'drop .uploadDropper'(event: any, target: any) {
        event.preventDefault();
        const file: File = event.originalEvent.dataTransfer.files[0];
        if (file) {
            const fileString: string = await loadFile(file);
            console.log(fileString);
            UploadMap[this.uploadType](fileString); // use target instead of this for better typing
        } else {
            throw "invalid file";
        }
    },
    async 'change #file'(event: any, target: any) {
        const file: File = event.originalEvent.target.files[0]; // only handle one file for now
        if (file) {
            const fileString: string = await loadFile(file);
            console.log(fileString);
            UploadMap[this.uploadType](fileString); // use target instead of this for better typing
        } else {
            throw "invalid file";
        }
    }
});

async function loadFile(file: File): Promise<string> {
    let f: FileReader = new FileReader();
    let data: string;
    return new Promise<string>((resolve, reject) => {
        f.onloadend = (ev: any) => {
            console.log(ev);
            resolve(ev.currentTarget.result);
            return ev;
        };
        f.readAsText(file);
    });
}
