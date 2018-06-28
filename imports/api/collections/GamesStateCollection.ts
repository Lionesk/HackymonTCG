import {GameStateInterface} from '../../gameLogic/GameState'
import { Mongo } from "meteor/mongo";


let GameStates: Mongo.Collection<GameStateInterface>;
if(!GameStates) {
    GameStates = new Mongo.Collection<GameStateInterface>('gamestates');
}

export { GameStates };