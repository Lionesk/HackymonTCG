import {Player} from './Player';

export class GameState{
    player:Player;
    ai:Player;

    constructor(){
        this.player = new Player();
        this.ai = new Player();
    }
}