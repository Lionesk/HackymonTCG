import {Player} from './Player';

export interface GameStateInterface{
    userid:string;
    player:Player;
    ai:Player;
    humanFirst:boolean;
    energyPlayed:boolean;
    isFirstRound:boolean;
    playing: boolean;
    winner:Player;
    isSecondRound:boolean;
    humanMulliganCount: number;
    aiMulliganCount: number;
    combatLog:[string];
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
    winner:Player;
    combatLog:[string];    
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
        this.combatLog=["Pick your active pokemon then end your turn"];
    }
}
