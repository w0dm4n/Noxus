import Logger from "../../io/logger"
import FightTeam from "./fight_team"
import Fighter from "./fighter"
import FightTimeline from "./fight_timeline"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Basic from "../../utils/basic"
import MapPoint from "../../game/pathfinding/map_point"
import Pathfinding from "../../game/pathfinding/pathfinding"
import SpellManager from "../spell/spell_manager"
import FightSpellProcessor from "./fight_spell_processor"
import * as Shapes from "./fight_shape_processor"
import Dofus1Line from "../map_tools/dofus_1_line"
import InvisibilityStateEnum from "../../enums/invisibility_state_enum"

import FightPVMResult from "./results/fight_pvm_result"
import FightChallengeResult from "./results/fight_challenge_result"

export default class Fight {

    static FIGHT_LEAVE_TYPE = {
        ABANDONED: 1,
        FORCED: 2,
        DISCONNECTED: 3,
    }

    static FIGHT_TYPE = {
        FIGHT_TYPE_CHALLENGE: 0,
        FIGHT_TYPE_AGRESSION: 1,
        FIGHT_TYPE_PvMA: 2,
        FIGHT_TYPE_PvM: 4
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
        this.teams.red = new FightTeam(this, 0, new Fighter(this).initFromCharacter(fighterOne.character));
        this.map = fighterOne.character.getMap();
        this.placementCells = { red: this.generateProceduralyCells(), blue: this.generateProceduralyCells() }; // TODO: Fix place cells or with pattern
        this.teams.red.placementCells = this.placementCells.red;
        this.winner = null;
        this.looser = null;
        this.timeline = new FightTimeline(this);
        this.cache = { buffId: 0, monsterId: 0 };
        this.glyphs = [];
    }

    incrementCacheValue(value, negatif = false) {
        var v = this.cache[value];
        v += negatif ? -1 : 1;
        this.cache[value] = v;
        return v;
    }

    send(packet) {
        for (var f of this.allFighters()) {
            if (!f.isAI)
                f.send(packet);
        }
    }

    sendExcept(packet, fighter) {
        for (var f of this.allFighters()) {
            if (f.id == fighter.id) continue;
            if (!f.isAI)
                f.send(packet);
        }
    }

    allFighters() {
        var data = [];
        data = data.concat(this.teams.blue.members);
        data = data.concat(this.teams.red.members);
        return data;
    }

    allAliveFighters() {
        var data = [];
        data = data.concat(this.teams.blue.getAliveMembers());
        data = data.concat(this.teams.red.getAliveMembers());
        return data;
    }

    initialize() {
        Logger.debug("Initializing fight id: " + this.id);
        for (var fighter of this.allFighters()) {
            if (fighter.fighterType == Fighter.FIGHTER_TYPE.HUMAN) {
                this.map.removeClient(fighter.character.client);
                fighter.createContext();
                fighter.getStats().sendStats();
                fighter.send(new Messages.GameFightStartingMessage(this.fightType, this.teams.blue.leader.id, this.teams.red.leader.id));
            }
            this.sendStartupPhase(fighter)
        }
        for (var fighter of this.allFighters()) {
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
        for (var i = 0; i <= 8; i++) {
            placements.push(cells[Basic.getRandomInt(0, cells.length)].id);
        }
        return placements;
    }

    sendStartupPhase(fighter) {
        if (this.fightState != Fight.FIGHT_STATES.STARTING) return;
        fighter.send(new Messages.GameFightPlacementPossiblePositionsMessage(this.placementCells.red, this.placementCells.blue, fighter.team.id));
        fighter.team.placeFighterOnAvailableCell(fighter);
    }

    joinTeam(client, fighterId) {
        var fighter = new Fighter(this).initFromCharacter(client.character);
        var team = null;
        if (this.teams.red.isInThisTeam(fighterId)) {
            team = this.teams.red;
        } else if (this.teams.blue.isInThisTeam(fighterId)) {
            team = this.teams.blue;
        }
        if(team.isMonsterTeam) {
            return;
        }
        fighter.team = team;
        team.addMember(fighter);
        this.map.removeClient(fighter.character.client);
        fighter.createContext();
        fighter.send(new Messages.GameFightStartingMessage(this.fightType, this.teams.blue.leader.id, this.teams.red.leader.id));
        this.sendStartupPhase(fighter)
        this.showFighters(fighter);
        this.send(new Messages.GameFightShowFighterMessage(fighter.getGameFightFighterInformations()));
        this.refreshBaseFighters();
        this.synchronizeFight();
    }

    getFighterOnCell(cellId) {
        for (var fighter of this.allFighters()) {
            if (fighter.cellId == cellId) return fighter;
        }
        return null;
    }

    getFighterById(id) {
        var fighters = this.allFighters();
        for (var fighter of fighters) {
            if (fighter.id == id)
                return fighter;
        }
        return null;
    }

    getOppositeTeam(team) {
        if (this.teams.red.leader.id == team.leader.id) return this.teams.blue;
        return this.teams.red;
    }

    showFighters(fighter) {
        for (var other of this.allFighters()) {
            fighter.send(new Messages.GameFightShowFighterMessage(other.getGameFightFighterInformations()));
        }
    }

    requestFightPlacement(fighter, cellId) {
        if (this.fightState != Fight.FIGHT_STATES.STARTING) return;
        if (this.getFighterOnCell(cellId)) {
            return;
        }

        fighter.cellId = cellId;
        this.refreshPlacementPositions();
    }

    refreshPlacementPositions() {
        if (this.fightState != Fight.FIGHT_STATES.STARTING) return;
        var dispositions = [];
        for (var f of this.allFighters()) {
            dispositions.push(new Types.IdentifiedEntityDispositionInformations(f.cellId, f.dirId, f.id));
        }
        this.send(new Messages.GameEntitiesDispositionMessage(dispositions));
    }

    checkStartupPhaseReady() {
        if (this.fightState != Fight.FIGHT_STATES.STARTING) return;
        var ready = true;
        for (var f of this.allFighters()) {
            if (!f.ready) ready = false;
        }
        if (ready) {
            Logger.debug("Starting fight id: " + this.id);
            this.startFight();
        }
    }

    leaveFight(fighter, leaveType) {
        var team = fighter.team;
        team.removeMember(fighter);
        if(!fighter.isAI) {
            this.send(new Messages.GameFightRemoveTeamMemberMessage(this.id, team.id, fighter.id));
            this.send(new Messages.GameFightLeaveMessage(fighter.id));
            this.send(new Messages.GameContextRemoveElementMessage(fighter.id));
        }

        fighter.alive = false;
        if (!fighter.isAI) {
            fighter.character.fight = null;
            fighter.character.fighter = null;
        }

        if (this.fightState != Fight.FIGHT_STATES.END) this.checkEnd();

        if (this.fightState == Fight.FIGHT_STATES.FIGHTING) {
            if (this.timeline.currentFighter().id == fighter.id) {
                this.timeline.next();
                this.timeline.remixTimeline();
            }
        }

        if (this.fightState == Fight.FIGHT_STATES.END) {
            this.showFightEnd(fighter, this.winner, this.looser);
        }

        if (!fighter.isAI) {
            fighter.restoreRoleplayContext();
        }
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

        if (this.fightState != Fight.FIGHT_STATES.END) this.checkEnd();

        if (this.fightState == Fight.FIGHT_STATES.FIGHTING) {
            if (this.timeline.currentFighter().id == fighter.id) {
                this.timeline.next();
                this.timeline.remixTimeline();
            }
        }
    }

    checkEnd() {
        var alive = true;
        if (this.teams.red.members.length <= 0 || this.teams.blue.members.length <= 0) {
            alive = false;
        }

        if (this.teams.red.getAliveMembers() <= 0 || this.teams.blue.getAliveMembers() <= 0) {
            alive = false;
        }

        if (!alive) {
            this.endFight();
        }
    }

    synchronizeFight(fighter = null, except = false) {
        var gameFightFighterInformations = [];
        var forTeam = [];
        for (var f of this.allFighters()) {
            if (f.isInvisible()) {
                if (fighter) {
                    if (fighter.team == f.team) {
                        forTeam.push(f.getGameFightFighterInformations());
                    }
                }
                else {
                    gameFightFighterInformations.push(f.getGameFightFighterInformations());
                }
            }
            else {
                gameFightFighterInformations.push(f.getGameFightFighterInformations());
            }
        }
        if (fighter && except)
            this.sendExcept(new Messages.GameFightSynchronizeMessage(gameFightFighterInformations), fighter);
        else {
            this.send(new Messages.GameFightSynchronizeMessage(gameFightFighterInformations));
        }
        if (forTeam.length > 0 && fighter) {
            fighter.team.send(new Messages.GameFightSynchronizeMessage(forTeam));
        }
    }

    setWinner(team) {
        this.winner = team;
        this.looser = this.getOppositeTeam(team);
    }

    endFight() {
        if (this.fightState == Fight.FIGHT_STATES.STARTING) {
            this.removeMapBlades();
        }

        // Check winners
        if (this.teams.red.members.length <= 0) {
            this.setWinner(this.teams.blue);
        } else if (this.teams.blue.members.length <= 0) {
            this.setWinner(this.teams.red);
        }

        if (this.teams.red.getAliveMembers() <= 0) {
            this.setWinner(this.teams.blue);
        } else if (this.teams.blue.getAliveMembers() <= 0) {
            this.setWinner(this.teams.red);
        }

        this.fightState = Fight.FIGHT_STATES.END;
        var self = this;
        setTimeout(function () {
            for (var f of self.allFighters()) {
                self.leaveFight(f, Fight.FIGHT_LEAVE_TYPE.FORCED);
            }
        }, 2000);
    }


    showFightEnd(fighter, winners, loosers) {
        var winnerResult = [];
        var looserResult = [];

        for (var f of winners.fixedMembers) {
            var entry = null;
            switch(this.fightType) {
                case Fight.FIGHT_TYPE.FIGHT_TYPE_CHALLENGE:
                    entry = new FightChallengeResult(fighter, this, f, true).getEntry()
                    break;
                case Fight.FIGHT_TYPE.FIGHT_TYPE_PvM:
                    entry = new FightPVMResult(fighter, this, f, true, winners, loosers).getEntry()
                    break;
            }
            winnerResult.push(entry);
        }

        for (var f of loosers.fixedMembers) {
            var entry = null;
            switch(this.fightType) {
                case Fight.FIGHT_TYPE.FIGHT_TYPE_CHALLENGE:
                    entry = new FightChallengeResult(fighter, this, f, false).getEntry()
                    break;
                case Fight.FIGHT_TYPE.FIGHT_TYPE_PvM:
                    entry = new FightPVMResult(fighter, this, f, false, winners, winners).getEntry()
                    break;
            }
            winnerResult.push(entry);
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

    getFightObstacles(out) {
        if (!out) out = [];
        var obs = [];
        for (var f of this.allAliveFighters()) {
            if (out.indexOf(f.cellId) != -1) continue;
            obs.push(f.cellId);
        }
        return obs;
    }

    getGlyphsOnCell(cellId)
    {
        var glyphs = [];
        for (var glyph of this.glyphs)
        {
            for (var cell of glyph.cells) {
                if (cell == cellId)
                    glyphs.push(glyph);
            }
        }
        return glyphs;
    }

    requestMove(fighter, keyMovements, pathfinding, isServer = false) {
        Logger.debug("Fighter id: " + fighter.id + ", request move (keys len: " + keyMovements.length + ")");
        var cells = [];
        for (var i in keyMovements) {
            if(!isServer) {
                cells.push({ id: keyMovements[i] & 4095, dir: keyMovements[i] >> 12, point: MapPoint.fromCellId(keyMovements[i] & 4095) });
            }
            else {
                cells.push({ id: keyMovements[i], point: MapPoint.fromCellId(keyMovements[i]) });
            }
        }
        pathfinding.fightMode = true;
        var lastPath = cells[0].id;
        var pathTotal = [];
        if (cells.length > 0) {
            for (var i = 1; i < cells.length; i++) {
                var pathfinding = new Pathfinding(this.map.dataMapProvider);
                var path = pathfinding.findShortestPath(lastPath, cells[i].id, []);
                lastPath = cells[i].id;
                pathTotal = pathTotal.concat(path);
            }
        }
        var fightersCells = this.getAllFightersCell();
        var pathWithGlyph = [];
        for (var cell of pathTotal)
        {
            if (this.getCellByIdFromId(fightersCells, cell.id) != null) {
                Logger.debug("Can't move here, fighter found on cell !");
                break;
            }
            pathWithGlyph.push(cell);
            var glyphsOnCell = this.getGlyphsOnCell(cell.id);
            if (glyphsOnCell.length > 0) {
                for (var glyph of glyphsOnCell) {
                    setTimeout(function () {
                        glyph.apply(fighter);
                    }, pathWithGlyph.length * 200);
                }
                break;
            }
        }

        var movementKeys = [fighter.cellId];
        for (var cell of pathWithGlyph)
            movementKeys.push(cell.id);

        var distance = pathWithGlyph.length;
        Logger.debug("Fighter want to move to a distance equals to: " + distance);

        if(!fighter.isMyTurn()) {
            Logger.error("Can't move because is not the fighter turn ..");
            return;
        }

        if (pathWithGlyph.length > 0) {
            if (fighter.current.MP - distance >= 0) {
                if (fighter.isInvisible()) {
                    fighter.team.send(new Messages.SequenceStartMessage(5, fighter.id));
                    fighter.team.send(new Messages.GameMapMovementMessage(movementKeys, fighter.id));
                    fighter.team.send(new Messages.GameActionFightPointsVariationMessage(129, fighter.id, fighter.id, -(distance)));
                    fighter.team.send(new Messages.SequenceEndMessage(3, fighter.id, 5));
                }
                else {
                    this.send(new Messages.SequenceStartMessage(5, fighter.id));
                    this.send(new Messages.GameMapMovementMessage(movementKeys, fighter.id));
                    this.send(new Messages.GameActionFightPointsVariationMessage(129, fighter.id, fighter.id, -(distance)));
                    this.send(new Messages.SequenceEndMessage(3, fighter.id, 5));
                }
                fighter.cellId = pathWithGlyph[pathWithGlyph.length - 1].id;
                fighter.current.MP -= distance;
            }
        }
        else {
            fighter.character.replyLangsMessage(1, 276, []);
            var cell = MapPoint.fromCellId(fighter.cellId);
            fighter.character.client.send(new Messages.GameMapNoMovementMessage(cell._nX, cell._nY));
        }
    }

    getCellById(cells, cellId) {
        for (var cell of cells) {
            if (cell.id == cellId)
                return cell;
        }
        return null;
    }

    getCellByIdFromId(cells, cellId) {
        for (var cell of cells) {
            if (cell == cellId)
                return cell;
        }
        return null;
    }

    getAllFightersCell() {
        var cells = [];
        var fighters = this.allAliveFighters();
        for (var fighter of fighters)
            cells.push(fighter.cellId);
        return cells;
    }

    fighterOnTheLine(cells, cellId, currentFighterCell) {
        for (var cell of cells) {
            if (cell != currentFighterCell) {
                if (cell == cellId)
                    return true;
            }
        }
        return false;
    }

    checkLos(fighter, cellId) {
        var from = MapPoint.fromCellId(fighter.cellId);
        var to = MapPoint.fromCellId(cellId);
        var line = Dofus1Line.getLine(from.x, from.y, 0, to.x, to.y, 0);
        var fightersCells = this.getAllFightersCell();

        for (var point of line) {
            var cell = MapPoint.fromCoords(point.x, point.y);
            if (cell) {
                var cellData = this.getCellById(this.map.cells, cell._nCellId);
                if (cellData) {
                    if (this.fighterOnTheLine(fightersCells, cellData.id, cellId))
                        return false;
                    if (!cellData._los)
                        return false;
                    if (cellData.id == cellId)
                        break;
                }
                else
                    return false;
            }
            else
                return false;
        }
        return true;
    }

    checkRange(fighter, spellLevel, cellId, isServer = false) {
        var result = false;
        var range = spellLevel.range;
        if (spellLevel.rangeCanBeBoosted)
            range += fighter.getStats().getTotalStats(19);
        if (range < 1)
            range = 1;
        if (spellLevel.castInLine == false) {
            var lozenge = new Shapes.Lozenge(range, spellLevel.minRange);
            var cells = lozenge.getCells(fighter.cellId);
            if (cells.indexOf(cellId) != -1)
                result = true;
        }
        else {
            var line = new Shapes.Cross(spellLevel.minRange, range);
            line._diagonal = false;
            var cells = line.getCells(fighter.cellId);
            if (cells.indexOf(cellId) != -1)
                result = true;
        }
        if (spellLevel.castTestLos) {
            if (!this.checkLos(fighter, cellId, range)) {
                if(!isServer) {
                    this.castSpellError(fighter, spellLevel._id, {id: 1, messageId: 174, params: []});
                }
                return false;
            }
        }
        if (result == false) {
            if(!isServer) {
                if (fighter.cellId == cellId) {
                    this.castSpellError(fighter, spellLevel._id, {
                        id: 0,
                        messageId: 0,
                        params: ["Impossible de lancer ce sort : vous ne pouvez pas le lancer sur vous-même."]
                    });
                }
                else {
                    this.castSpellError(fighter, spellLevel._id, {
                        id: 0,
                        messageId: 0,
                        params: ["Impossible de lancer ce sort : vous n'avez pas la portée."]
                    });
                }
            }
        }
        return result;
    }

    requestCastSpell(fighter, spellId, cellId) {
        //TODO: Check cellId validity
        var spell = fighter.character.statsManager.getSpell(spellId);
        if (spell) {
            var spellLevel = SpellManager.getSpellLevel(spellId, spell.spellLevel);
            if (spellLevel) {
                this.castSpell(fighter, spell, spellLevel, cellId);
            }
        }
    }

    castSpellError(fighter, spellId, message) {
        fighter.character.client.send(new Messages.GameActionFightNoSpellCastMessage(spellId));
        if (message) {
            if (message.messageId != 0)
                fighter.character.replyLangsMessage(message.id, message.messageId, message.params);
            else
                fighter.character.replyImportant(message.params[0]);
        }
    }

    checkFighterStates(fighter, spell, spellLevel) {
        for (var stateForbidden of spellLevel.statesForbidden) {
            if (fighter.hasState(stateForbidden)) {
                return false;
            }
        }
        for (var stateRequired of spellLevel.statesRequired) {
            if (!fighter.hasState(stateRequired)) {
                return false;
            }
        }
        return true;
    }

    isCritical(criticalProbability) {
        var rand = Basic.getRandomInt(0, 100);
        if (criticalProbability > 100)
            criticalProbability = 100;
        else if (criticalProbability < 0)
            criticalProbability = 0;

        return ((criticalProbability >= rand) ? true : false);
    }

    castSpell(fighter, spell, spellLevel, cellId) {
        if (fighter.current.AP >= spellLevel.apCost && fighter.isMyTurn()) {
            if (this.checkRange(fighter, spellLevel, cellId)) {
                if (fighter.canCastSpell(spellLevel,cellId)) {
                    if (this.checkFighterStates(fighter, spell, spellLevel)) {
                        var effects = spellLevel.effects;
                        var criticalResult = 1;
                        if (spellLevel.criticalHitProbability > 0) {
                            if (this.isCritical((spellLevel.criticalHitProbability + fighter.getStats().getTotalStats(21)))) {
                                effects = spellLevel.criticalEffect;
                                criticalResult = 2;
                            }
                        }
                        fighter.current.AP -= spellLevel.apCost;
                        fighter.sequenceCount = 1;
                        this.send(new Messages.SequenceStartMessage(1, fighter.id));
                        this.send(new Messages.GameActionFightSpellCastMessage(300, fighter.id, 0, cellId, criticalResult, false, true, spell.spellId, spell.spellLevel, []));
                        fighter.sequenceCount++;
                        this.send(new Messages.GameActionFightPointsVariationMessage(102, fighter.id, fighter.id, -(spellLevel.apCost)));
                        fighter.sequenceCount++;
                        FightSpellProcessor.process(this, fighter, spell, spellLevel, effects, cellId);
                        this.send(new Messages.SequenceEndMessage(fighter.sequenceCount, fighter.id, 1));
                        fighter.spellHistory.insertSpell(spellLevel,this.getFighterOnCell(cellId));
                    }
                    else {
                        this.castSpellError(fighter, spellLevel._id, { id: 1, messageId: 116, params: [] });
                    }
                }else{
                      this.castSpellError(fighter, spellLevel._id, {
                    id: 0,
                    messageId: 0,
                    params: ["Impossible de lancer ce sort : limite d'utilisation par tour atteinte."]
                });
                }
            }
        }
    }
}