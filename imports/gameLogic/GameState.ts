import {Player} from './Player';

export class GameState{
    player:Player;
    ai:Player;
    round:number;
    humanFirst:boolean;

    constructor(){
        this.player = new Player();
        this.ai = new Player();
        this.round = 0;
    }
}