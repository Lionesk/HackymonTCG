import {Player} from './Player';

export interface GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    round:number;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    playing: boolean;
}

export class GameState implements GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    round:number;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    playing: boolean;
    

    constructor(userid:string){
        this.player = new Player();
        this.ai = new Player();
        this.round = 0;
        this.userid=userid;
        this.energyPlayed=false;
        this.isFirstRound=true;
        this.playing = false;
    }
}
