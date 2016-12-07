import Logger from "../../io/logger"
import FightTeam from "./fight_team"
import Fighter from "./fighter"
import FightTimeline from "./fight_timeline"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Basic from "../../utils/basic"
import MapPoint from "../../game/pathfinding/map_point"
import Pathfinding from "../../game/pathfinding/pathfinding"


export default class Fight {

    static FIGHT_LEAVE_TYPE = {
        ABANDONED: 1,
        FORCED: 2,
        DISCONNECTED: 3,
    }

    static FIGHT_TYPE = {
        FIGHT_TYPE_CHALLENGE: 0,
        FIGHT_TYPE_AGRESSION: 1,
        FIGHT_TYPE_PvMA: 2
    };

    static FIGHT_STATES = {
        "STARTING": 1,
        "FIGHTING": 2,
        "END": 3
    };

    constructor(fighterOne) {
        this.id = Math.floor(new Date().valueOf() / 10000);
        this.fightState = Fight.FIGHT_STATES.STARTING;
        this.fightType = Fight.FIGHT_TYPE.FIGHT_TYPE_CHALLENGE;
        this.teams = {};
        this.teams.red = new FightTeam(this, 0, new Fighter(fighterOne.character, this));
        this.map = fighterOne.character.getMap();
        this.placementCells = { red: this.generateProceduralyCells(), blue: this.generateProceduralyCells() }; // TODO: Fix place cells or with pattern
        this.teams.red.placementCells = this.placementCells.red;
        this.winner = null;
        this.looser = null;
        this.timeline = new FightTimeline(this);
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
            fighter.send(new Messages.GameFightStartingMessage(this.fightType, this.teams.blue.leader.id, this.teams.red.leader.id));
            this.sendStartupPhase(fighter)
        }
        for(var fighter of this.allFighters()) {
            this.showFighters(fighter);
        }
        this.displayMapBlades();
        this.refreshBaseFighters();
    }

    refreshBaseFighters() {
        this.baseFighters = this.allFighters();
    }

    getFightCommonInformations() {
        return new Types.FightCommonInformations(this.id, this.fightType, [this.teams.red.getFightTeamInformations(), this.teams.blue.getFightTeamInformations()],
            [this.teams.red.bladeCellId, this.teams.blue.bladeCellId], [this.teams.red.getFightOptionsInformations(), this.teams.blue.getFightOptionsInformations()])
    }

    displayMapBlades() {
        this.map.send(new Messages.GameRolePlayShowChallengeMessage(this.getFightCommonInformations()));
    }

    removeMapBlades() {
        this.map.send(new Messages.GameRolePlayRemoveChallengeMessage(this.id));
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
        if(this.fightState != Fight.FIGHT_STATES.STARTING) return;
        fighter.send(new Messages.GameFightPlacementPossiblePositionsMessage(this.placementCells.red, this.placementCells.blue, fighter.team.id));
        fighter.team.placeFighterOnAvailableCell(fighter);
    }

    joinTeam(client, fighterId) {
        var fighter = new Fighter(client.character, this);
        var team = null;
        if(this.teams.red.isInThisTeam(fighterId)) {
            team = this.teams.red;
        } else if (this.teams.blue.isInThisTeam(fighterId))  {
            team = this.teams.blue;
        }
        team.addMember(fighter);

        this.map.removeClient(fighter.character.client);
        fighter.createContext();
        fighter.send(new Messages.GameFightStartingMessage(this.fightType, this.teams.blue.leader.id, this.teams.red.leader.id));
        this.sendStartupPhase(fighter)
        this.showFighters(fighter);
        this.send(new Messages.GameFightShowFighterMessage(fighter.getGameFightFighterInformations()));
        this.refreshBaseFighters();
    }

    getFighterOnCell(cellId) {
        for(var fighter of this.allFighters()) {
            if(fighter.cellId == cellId) return fighter;
        }
        return null;
    }

    getOppositeTeam(team) {
        if(this.teams.red.leader.id == team.leader.id) return this.teams.blue;
        return this.teams.red;
    }

    showFighters(fighter) {
        for(var other of this.allFighters()) {
            fighter.send(new Messages.GameFightShowFighterMessage(other.getGameFightFighterInformations()));
        }
    }

    requestFightPlacement(fighter, cellId) {
        if(this.fightState != Fight.FIGHT_STATES.STARTING) return;
        if(this.getFighterOnCell(cellId)){
            return;
        }

        fighter.cellId = cellId;
        this.refreshPlacementPositions();
    }

    refreshPlacementPositions() {
        if(this.fightState != Fight.FIGHT_STATES.STARTING) return;
        var dispositions = [];
        for(var f of this.allFighters()) {
            dispositions.push(new Types.IdentifiedEntityDispositionInformations(f.cellId, f.dirId, f.id));
        }
        this.send(new Messages.GameEntitiesDispositionMessage(dispositions));
    }

    checkStartupPhaseReady() {
        if(this.fightState != Fight.FIGHT_STATES.STARTING) return;
        var ready = true;
        for(var f of this.allFighters()) {
            if(!f.ready) ready = false;
        }
        if(ready) {
            Logger.debug("Starting fight id: " + this.id);
            this.startFight();
        }
    }

    leaveFight(fighter, leaveType) {
        var team = fighter.team;
        team.removeMember(fighter);
        this.send(new Messages.GameFightRemoveTeamMemberMessage(this.id, team.id, fighter.id));
        this.send(new Messages.GameFightLeaveMessage(fighter.id));
        this.send(new Messages.GameContextRemoveElementMessage(fighter.id));

        fighter.alive = false;
        fighter.character.fight = null;
        fighter.character.fighter = null;

        if(this.fightState == Fight.FIGHT_STATES.FIGHTING){
            if(this.timeline.currentFighter().id == fighter.id) {
                this.timeline.next();
                this.timeline.remixTimeline();
            }
        }

        if(this.fightState != Fight.FIGHT_STATES.END) this.checkEnd();

        if(this.fightState == Fight.FIGHT_STATES.END) {
            this.showFightEnd(fighter, this.winner, this.looser);
        }

        fighter.restoreRoleplayContext();
    }

    disconnectFighter(fighter) {
        var team = fighter.team;
        team.removeMember(fighter);
        this.send(new Messages.GameFightRemoveTeamMemberMessage(this.id, team.id, fighter.id));
        this.send(new Messages.GameFightLeaveMessage(fighter.id));
        this.send(new Messages.GameContextRemoveElementMessage(fighter.id));

        fighter.alive = false;
        fighter.character.fight = null;
        fighter.character.fighter = null;

        if(this.fightState == Fight.FIGHT_STATES.FIGHTING){
            if(this.timeline.currentFighter().id == fighter.id) {
                this.timeline.next();
                this.timeline.remixTimeline();
            }
        }

        if(this.fightState != Fight.FIGHT_STATES.END) this.checkEnd();
    }

    checkEnd() {
        var alive = true;
        if(this.teams.red.members.length <= 0 || this.teams.blue.members.length <= 0) {
            alive = false;
        }

        if(!alive) {
            this.endFight();
        }
    }

    synchronizeFight() {
        var gameFightFighterInformations = [];
        for(var f of this.allFighters()) {
            gameFightFighterInformations.push(f.getGameFightFighterInformations());
        }
        this.send(new Messages.GameFightSynchronizeMessage(gameFightFighterInformations));
    }

    setWinner(team) {
        this.winner = team;
        this.looser = this.getOppositeTeam(team);
    }

    endFight() {
        if(this.fightState == Fight.FIGHT_STATES.STARTING) {
            this.removeMapBlades();
        }

        // Check winners
        if(this.teams.red.members.length <= 0) {
            this.setWinner(this.teams.blue);
        } else if (this.teams.blue.members.length <= 0) {
            this.setWinner(this.teams.red);
        }

        this.fightState = Fight.FIGHT_STATES.END;
        for(var f of this.allFighters()) {
            this.leaveFight(f, Fight.FIGHT_LEAVE_TYPE.FORCED);
        }
    }


    showFightEnd(fighter, winners, loosers) {
        var winnerResult = [];
        var looserResult = [];

        for(var f of winners.fixedMembers) {
            winnerResult.push(new Types.FightResultMutantListEntry(2, 0, new Types.FightLoot([], 0), f.id, f.alive, f.level));
        }

        for(var f of loosers.fixedMembers) {
            looserResult.push(new Types.FightResultMutantListEntry(0, 0, new Types.FightLoot([], 0), f.id, f.alive, f.level));
        }

        var result = [];
        result = result.concat(winnerResult);
        result = result.concat(looserResult);

        fighter.send(new Messages.GameFightEndMessage(0, -1, -1, result, []));
    }

    startFight() {
        this.fightState = Fight.FIGHT_STATES.FIGHTING;
        this.removeMapBlades();
        this.send(new Messages.GameFightStartMessage([])); //TODO: Idols
        this.teams.blue.fixedMembers = this.teams.blue.members.slice();
        this.teams.red.fixedMembers = this.teams.red.members.slice();
        this.timeline.refreshTimeline();
        this.timeline.next();
    }

    getFightObstacles() {
        var obs = [];
        for(var f of this.allFighters()) {
            obs.push(f.cellId);
        }
        return obs;
    }

    requestMove(fighter, keyMovements, pathfinding) {
        Logger.debug("Fighter id: " + fighter.id + ", request move (keys len: " + keyMovements.length + ")");
        var cells = [];
        for(var i in keyMovements) {
            cells.push({id: keyMovements[i] & 4095, dir: keyMovements[i] >> 12, point: MapPoint.fromCellId(keyMovements[i] & 4095)});
        }
        pathfinding.fightMode = true;
        var lastPath = cells[0].id;
        var pathTotal = [];
        if(cells.length > 0) {
            for(var i = 1; i < cells.length; i++) {
                var pathfinding = new Pathfinding(this.map.dataMapProvider);
                var path = pathfinding.findShortestPath(lastPath, cells[i].id, this.getFightObstacles());
                lastPath = cells[i].id;
                pathTotal = pathTotal.concat(path);
            }
        }

        var distance = pathTotal.length;
        Logger.debug("Fighter want to move to a distance equals to: " + distance);

        if(fighter.current.MP - distance >= 0) {
            this.send(new Messages.SequenceStartMessage(5, fighter.id));
            this.send(new Messages.GameMapMovementMessage(keyMovements, fighter.id));
            this.send(new Messages.GameActionFightPointsVariationMessage(129, fighter.id, fighter.id, -(distance)));
            this.send(new Messages.SequenceEndMessage(3, fighter.id, 5));
            fighter.cellId = cells[cells.length - 1].id;
            fighter.current.MP -= distance;
        }
    }
}