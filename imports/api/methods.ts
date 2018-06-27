import { Meteor } from "meteor/meteor";
import { Cards, CardType, PokemonCat, EnergyCat } from "./collections";
import { GameStates } from "./collections";
import { GameManager } from "../gameLogic/GameManager";
import { GameState } from "../gameLogic/GameState";
import { PlayableCard } from "../gameLogic/PlayableCard";
import { parseAbilityString, parseCardString } from "../util/fileParsers";

Meteor.methods({
    printToServerConsole() {
        if(Meteor.isServer){
            console.log("Printing To Server Console");
        }
    },
    upsertNewGameState:function(){
        if(Meteor.isServer){
            GameStates.update({userid:Meteor.userId()},new GameState(Meteor.userId()),{upsert:true});
        }
    },
    newGameStart:function(deck: number[], shuffle: boolean){
        if(Meteor.isServer){
            GameManager.initializeGame(deck, shuffle);
        }
    },
    createNewStateIfNotExisting:function(){
        if(Meteor.isServer){
            let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            if(!gs){
                GameStates.update({userid:Meteor.userId()},new GameState(Meteor.userId()),{upsert:true});
            }
        }
    },
    drawCard:function(humanPlayer:boolean, n?:number){
        if(Meteor.isServer){
            if(n){
                GameManager.draw(humanPlayer, n);
            }
            else{
                GameManager.draw(humanPlayer);
            }
        }
    },
    addEnergy:function(humanPlayer: boolean, pokemonPlayableCard:PlayableCard, energyPlayableCard:PlayableCard){
        if(Meteor.isServer){
            GameManager.addEnergy(humanPlayer, pokemonPlayableCard, energyPlayableCard);
        }
    },
    evolvePokemon:function(humanPlayer: boolean, pokemonPlayableCardEvolver:PlayableCard, pokemonPlayableCard:PlayableCard){
        if(Meteor.isServer){
            GameManager.evolve(humanPlayer, pokemonPlayableCard, pokemonPlayableCardEvolver);
        }
    },
    benchPokemon:function(humanPlayer: boolean, pokemonPlayableCard:PlayableCard){
        if(Meteor.isServer){
            GameManager.placeBench(humanPlayer, pokemonPlayableCard);
        }
    },
    placeActive:function(humanPlayer: boolean, pokemonPlayableCard: PlayableCard){
        if(Meteor.isServer) {
            GameManager.placeActive(humanPlayer, pokemonPlayableCard);
        }
    },
    testModifyGameState:function(){
        if(Meteor.isServer){
            //simulates a change done by the gamemanager
            let gs = GameStates.find({"userid":Meteor.userId()}).fetch()[0];
            // let card = new Card();
            let counter: number = 0;
            gs.ai.hand.push(new PlayableCard(counter++));
            gs.ai.hand.push(new PlayableCard(counter++));
            gs.ai.hand.push(new PlayableCard(counter++));
            gs.ai.bench[0] = (new PlayableCard(counter++));
            gs.ai.bench[1] = (new PlayableCard(counter++));
            gs.ai.bench[2] = (new PlayableCard(counter++));
            gs.ai.active = (new PlayableCard(counter++));
            gs.ai.hand[0].card = Cards.find().fetch()[0];
            gs.ai.hand[1].card = Cards.find().fetch()[0];
            gs.ai.hand[2].card = Cards.find().fetch()[0];
            gs.ai.bench[0].card = Cards.find().fetch()[0];
            gs.ai.bench[1].card = Cards.find().fetch()[0];
            gs.ai.bench[2].card = Cards.find().fetch()[0];
            gs.ai.active.card = Cards.find().fetch()[0];
            console.log(Cards.find().fetch()[1]);
            gs.ai.hand[0].card.name="handcardname";
            gs.ai.hand[2].card.name="handcardname";
            gs.ai.hand[1].card.name="handcardname";
            gs.ai.hand[0].card.type=CardType.ENERGY;
            gs.ai.hand[0].card.category=EnergyCat.LIGHTNING;
            gs.ai.hand[1].card.type=CardType.ENERGY;
            gs.ai.hand[2].card.type=CardType.ENERGY;
            gs.ai.bench[1].card.name="benchcardname";
            gs.ai.bench[2].card.name="benchcardname";
            gs.ai.bench[0].card.name="benchcardname";
            gs.ai.active.card.name="activecardname";

            counter = 0;
            gs.player.hand.push(new PlayableCard(counter++));
            gs.player.hand.push(new PlayableCard(counter++));
            gs.player.hand.push(new PlayableCard(counter++));
            gs.player.bench[0] = (new PlayableCard(counter++));
            gs.player.bench[1] = (new PlayableCard(counter++));
            gs.player.bench[2] = (new PlayableCard(counter++));
            gs.player.active = (new PlayableCard(counter++));
            gs.player.hand[0].card = Cards.find().fetch()[0];
            gs.player.hand[1].card = Cards.find().fetch()[21];
            gs.player.hand[2].card = Cards.find().fetch()[2];
            gs.player.bench[0].card = Cards.find().fetch()[3];
            gs.player.bench[1].card = Cards.find().fetch()[4];
            gs.player.bench[2].card = Cards.find().fetch()[5];
            gs.player.active.card = Cards.find().fetch()[6];
            gs.player.bench[2].currentEnergy=[];
            gs.player.bench[2].currentEnergy.push(Cards.find().fetch()[55]);
            gs.player.bench[2].currentEnergy.push(Cards.find().fetch()[55]);
            gs.player.bench[2].currentEnergy.push(Cards.find().fetch()[24]);
            gs.player.bench[2].currentEnergy.push(Cards.find().fetch()[25]);
            console.log(Cards.find().fetch()[55]);
            gs.player.hand[0].card.name="evolvercardname1";
            // gs.player.hand[2].card.name="handcardname3";
            //gs.player.hand[1].card.name="handcardname2";
            // gs.player.hand[0].card.type=CardType.POKEMON;
            gs.player.hand[0].card.evolution="evolveecardname1";
            // gs.player.hand[1].card.type=CardType.ENERGY;
            // gs.player.hand[2].card.type=CardType.ENERGY;
            // gs.player.bench[0].card.category=PokemonCat.FIGHTING;
            // gs.player.bench[0].card.type=CardType.POKEMON;
            // gs.player.bench[2].card.category=PokemonCat.FIGHTING;
            // gs.player.bench[2].card.type=CardType.POKEMON;
            // gs.player.bench[1].card.name="benchcardname2";
            // gs.player.bench[2].card.name="benchcardname3";
            gs.player.bench[0].card.name="evolveecardname1";
            // gs.player.active.card.name="activecardname1";

            gs.player.hand[0].id=0; 
            gs.player.hand[1].id=1;
            gs.player.hand[2].id=2;
            gs.player.bench[0].id=3;
            gs.player.bench[1].id=4;
            gs.player.bench[2].id=5;
            gs.player.active.id=6;


            console.log("gs cahnged");

            GameStates.update({userid:Meteor.userId()},gs,{upsert:true});
        }
    },
    uploadCards(data: { fileString: string }) {
        if (Meteor.isServer) {
            parseCardString(data.fileString);
        }
    },
    uploadAbilities(data: { fileString: string }) {
        if (Meteor.isServer) {
            parseAbilityString(data.fileString);
        }
    },
    uploadDeck(data: { fileString: string }) {
        if (Meteor.isServer) {
            console.log(data.fileString);
        }
    },
});