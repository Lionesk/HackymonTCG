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
        this.winner=undefined;
        this.isSecondRound = true;
        this.combatLog=["Pick your active pokemon then end your turn"];
    }
}
