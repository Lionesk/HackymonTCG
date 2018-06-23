import {Player} from './Player';

export interface GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    round:number;
    humanFirst:boolean;

    // constructor(userid:string){
    //     this.player = new Player();
    //     this.ai = new Player();
    //     this.round = 0;
    //     this.userid=userid;
    // }
}

export class GameState implements GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    round:number;
    humanFirst:boolean;

    constructor(userid:string){
        this.player = new Player();
        this.ai = new Player();
        this.round = 0;
        this.userid=userid;
    }
}
