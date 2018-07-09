import {Player} from './Player';

export interface GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    isSecondRound:boolean;
}

export class GameState implements GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    isSecondRound:boolean;

    constructor(userid:string){
        this.player = new Player();
        this.ai = new Player();
        this.userid=userid;
        this.energyPlayed=false;
        this.isFirstRound=true;
        this.isSecondRound=true;
    }
}
