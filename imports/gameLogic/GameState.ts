import {Player} from './Player';

export interface GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    playing: boolean;
    isSecondRound:boolean;
    humanMulliganCount: number;
    aiMulliganCount: number;
}

export class GameState implements GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    playing: boolean;
    humanMulliganCount: number;
    aiMulliganCount: number;
    isSecondRound:boolean;

    constructor(userid:string){
        this.player = new Player();
        this.ai = new Player();
        this.userid=userid;
        this.energyPlayed=false;
        this.isFirstRound=true;
        this.playing = false;
        this.isSecondRound = true;
        this.humanMulliganCount=0;
        this.aiMulliganCount=0;
    }
}
