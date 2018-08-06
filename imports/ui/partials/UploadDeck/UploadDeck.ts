import "jquery";
import { Template } from 'meteor/templating';
import {Session} from 'meteor/session';
import './UploadDeck.html';
import { Cards, CardType, TrainerCat } from "../../../api/collections";
import { asyncCall } from "../../helpers";

enum UploadType {
    CARDS = "cards",
    DECK = "deck",
    ABIL = "abilities"
}

const UploadMap: { [key in UploadType]: (s: any) => void } = { // change this any
    cards: async (data) => asyncCall("uploadCards", { fileString: data }),
    deck: async (data) => asyncCall("uploadDeck", { fileString: data.fileString, name: data.name }),
    abilities: async (data) => asyncCall("uploadAbilities", { fileString: data }),
}

Template.UploadDeck.events({
    'dragover .uploadDropper'(e: JQuery.Event, t: any) {
        e.preventDefault();
      },
      'dragenter .uploadDropper'(e: JQuery.Event, t: any) {
        e.preventDefault();
        // change style of drop zone
      },
    async 'drop .uploadDropper'(event: JQuery.Event, target: any) {
        event.preventDefault();
        const file: File = (event.originalEvent as DragEvent).dataTransfer.files[0];
        if (file) {
            const fileString: string = await loadFile(file);
            if(this.uploadType === UploadType.DECK){
                if(fileString.split("\n").length !==60){
                    Session.set("deck-size-error",true);
                    return;
                }
                Session.set("deck-size-error",false);
                await UploadMap[this.uploadType as UploadType]({fileString: fileString, name: file.name}); // use target instead of this for better typing

            }else{
                await UploadMap[this.uploadType as UploadType](fileString); // use target instead of this for better typing
            }
        } else {
            throw "invalid file";
        }
    },
    async 'change #file'(event: JQuery.Event, target: any) {
        // TODO find a good type for this
        const file: File = (event.originalEvent as any).target.files[0]; // only handle one file for now
        if (file) {
            const fileString: string = await loadFile(file);
            if(this.uploadType === UploadType.DECK){
                console.log(fileString.split("\n").length)
                if(fileString.split("\n").length !==60){
                    Session.set("deck-size-error",true);
                    return;
                }
                Session.set("deck-size-error",false);
                await UploadMap[this.uploadType as UploadType]({fileString:fileString, name:file.name}); // use target instead of this for better typing

            }else{
                await UploadMap[this.uploadType as UploadType](fileString); // use target instead of this for better typing
            }
        } else {
            throw "invalid file";
        }
    }
});

async function loadFile(file: File): Promise<string> {
    let f: FileReader = new FileReader();
    let data: string;
    return new Promise<string>((resolve, reject) => {
        f.onloadend = (ev: FileReaderProgressEvent) => {
            console.log(ev);
            if (!ev.target) {
                reject("Event has no target");
            } else {
                resolve(ev.target.result);
            }
            return ev;
        };
        f.readAsText(file);
    });
}

Template.UploadDeck.helpers({
    deckError:function(){
        return Session.get("deck-size-error") && (this.uploadType === UploadType.DECK);
    }
})