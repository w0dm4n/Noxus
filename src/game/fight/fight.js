import Logger from "../../io/logger"
import FightTeam from "./fight_team"
import Fighter from "./fighter"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Basic from "../../utils/basic"

export default class Fight {

    static FIGHT_TYPE = {
        FIGHT_TYPE_CHALLENGE: 0,
        FIGHT_TYPE_AGRESSION: 1,
        FIGHT_TYPE_PvMA: 2
    };

    static FIGHT_STATES = {
      "STARTING": 1
    };

    constructor(fighterOne) {
        this.id = new Date().valueOf();
        this.fightState = Fight.FIGHT_STATES.STARTING;
        this.fightType = Fight.FIGHT_TYPE.FIGHT_TYPE_CHALLENGE;
        this.teams = {};
        this.teams.red = new FightTeam(this, 0, new Fighter(fighterOne.character, this));
        this.map = fighterOne.character.getMap();
        this.placementCells = { red: this.generateProceduralyCells(), blue: this.generateProceduralyCells() }; // TODO: Fix place cells or with pattern
        this.teams.red.placementCells = this.placementCells.red;
    }

    send(packet) {
        for(var f of this.allFighters()) {
            f.send(packet);
        }
    }

    allFighters() {
       var data = [];
       data = data.concat(this.teams.blue.members);
       data = data.concat(this.teams.red.members);
       return data;
    }

    initialize() {
        Logger.debug("Initializing fight id: " + this.id);
        for(var fighter of this.allFighters()) {
            this.map.removeClient(fighter.character.client);
            fighter.createContext();
            fighter.send(new Messages.GameFightStartingMessage(this.fightType, this.teams.blue.leader.character._id, this.teams.red.leader.character._id));
            this.sendStartupPhase(fighter)
        }
        for(var fighter of this.allFighters()) {
            this.showFighters(fighter);
        }
    }

    generateProceduralyCells() {
        var cells = this.map.getAvailableCells();
        var placements = [];
        for(var i = 0; i <= 8; i++) {
            placements.push(cells[Basic.getRandomInt(0, cells.length)].id);
        }
        return placements;
    }

    sendStartupPhase(fighter) {
        fighter.send(new Messages.GameFightPlacementPossiblePositionsMessage(this.placementCells.red, this.placementCells.blue, fighter.team.id));
        fighter.team.placeFighterOnAvailableCell(fighter);
    }

    getFighterOnCell(cellId) {
        for(var fighter of this.allFighters()) {
            if(fighter.cellId == cellId) return fighter;
        }
        return null;
    }

    showFighters(fighter) {
        for(var other of this.allFighters()) {
            fighter.send(new Messages.GameFightShowFighterMessage(other.getGameFightFighterInformations()));
        }
    }

    requestFightPlacement(fighter, cellId) {
        if(this.getFighterOnCell(cellId)){
            return;
        }

        fighter.cellId = cellId;
        this.refreshPlacementPositions();
    }

    refreshPlacementPositions() {
        var dispositions = [];
        for(var f of this.allFighters()) {
            dispositions.push(new Types.IdentifiedEntityDispositionInformations(f.cellId, f.dirId, f.character._id));
        }
        this.send(new Messages.GameEntitiesDispositionMessage(dispositions));
    }
}