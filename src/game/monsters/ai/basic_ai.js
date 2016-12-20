import Logger from "../../../io/logger"
import Pathfinding from "../../../game/pathfinding/pathfinding"
import Pathfinding2 from "../../../game/pathfinding/pathfinding_dijkstra"
import * as Types from "../../../io/dofus/types"
import * as Messages from "../../../io/dofus/messages"
import MapPoint from "../../pathfinding/map_point"
import SpellsManager from "../../spell/spell_manager"
import FightSpellProcessor from "../../fight/fight_spell_processor"
import * as Shapes from "../../fight/fight_shape_processor"

export default class BasicAI {

    constructor(fighter) {
        this.fighter = fighter;
    }

    process() {
        try {
            var self = this;
            /*
            var target = this.fighter.fight.getOppositeTeam(this.fighter.team).getAliveMembers()[0];
            var pathfinding = new Pathfinding(this.fighter.fight.map.dataMapProvider);
            pathfinding.fightMode = true;
            var path = pathfinding.findShortestPath(this.fighter.cellId, target.cellId, this.fighter.fight.getFightObstacles([this.fighter.cellId, target.cellId]));
            var self = this;
            this.move(path, function() {
                self.castBestSpells();
                self.fighter.passTurn();
            });
            */
            self.castBestSpells(self.getNearestFighter(), function(){
                self.walkToNearest(function() {
                    self.castBestSpells(self.getNearestFighter(), function(){
                        self.fighter.passTurn();
                    });
                });
            });
        }
        catch (e) {
            Logger.error("Can't process the monster AI because : " + e.message);
            this.fighter.passTurn();
        }
    }

    walkToNearest(callback) {
        var nearest = this.getNearestFighter();
        if(nearest) {
            // Experimentation
            var pathfinding_test = new Pathfinding2(this.fighter.fight.map.dataMapProvider);
            pathfinding_test.fightMode = true;
            var path = pathfinding_test.findShortestPath(this.fighter.cellId, nearest.cellId, this.fighter.fight.getFightObstacles([this.fighter.cellId, nearest.cellId]));
            //End test

            /*
            var pathfinding = new Pathfinding(this.fighter.fight.map.dataMapProvider);
            pathfinding.fightMode = true;
            var path = pathfinding.findShortestPath(this.fighter.cellId, nearest.cellId, this.fighter.fight.getFightObstacles([this.fighter.cellId, nearest.cellId]));
            */

            this.move(path, function() {
                callback();
            });
        }
        else {
            callback();
        }
    }

    findNearestPossibleCell(target) {
        var lozenge = new Shapes.Lozenge(this.fighter.current.MP, 1);
        var lozengeCells = lozenge.getCells(this.fighter.cellId);
        var lastScore = 99999999;
        var nearestCell = -1;
        var pathfinding = new Pathfinding(this.fighter.fight.map.dataMapProvider);
        pathfinding.fightMode = true;


        for(var cell of lozengeCells) {
            if(this.fighter.fight.map.isWalkableCell(cell)) {
                if(this.fighter.fight.getFighterOnCell(cell)) continue;
                pathfinding.reset();
                var path = pathfinding.findShortestPath(cell, target.cellId, this.fighter.fight.getFightObstacles([this.fighter.cellId, target.cellId]));
                var distance = path.length;

                if(distance < lastScore && distance > 0) {
                    nearestCell = cell;
                    lastScore = distance;
                }
            }
        }
        return nearestCell;
    }

    getNearestFighter() {
        var encounters = this.fighter.fight.getOppositeTeam(this.fighter.team);
        var point = MapPoint.fromCellId(this.fighter.cellId);
        var nearest = null;
        for(var f of encounters.getAliveMembers()) {
            var distance = point.distanceTo(MapPoint.fromCellId(f.cellId));
            if(nearest == null) {
                nearest = f;
            }
            else {
                if(point.distanceTo(MapPoint.fromCellId(f.cellId)) < point.distanceTo(MapPoint.fromCellId(nearest.cellId))) {
                    nearest = f;
                }
            }
        }

        return nearest;
    }

    move(path, callback) {
        var movementKeys = [];
        for(var c of path) {
            if(this.fighter.fight.getFightObstacles().indexOf(c) != -1 && c != this.fighter.cellId) {
                break;
            }
            if(this.fighter.current.MP <= 0) {
                break;
            }

            /*
            var glyphsOnCell = this.fighter.fight.getGlyphsOnCell(c.cell.id);
            if (glyphsOnCell.length > 0) {
                for (var glyph of glyphsOnCell) {
                    var self = this;
                    setTimeout(function () {
                        glyph.apply(self.fighter);
                    }, movementKeys.length * 200);
                }
                movementKeys.push(c.cell.id);
                this.fighter.cellId = c.cell.id;
                this.fighter.current.MP--;
                break;
            }
            */

            movementKeys.push(c);
            this.fighter.cellId = c;
            this.fighter.current.MP--;
        }
        this.fighter.fight.send(new Messages.SequenceStartMessage(5, this.fighter.id));
        this.fighter.fight.send(new Messages.GameMapMovementMessage(movementKeys, this.fighter.id));
        this.fighter.fight.send(new Messages.GameActionFightPointsVariationMessage(129, this.fighter.id, this.fighter.id, -(movementKeys.length - 1)));
        this.fighter.fight.send(new Messages.SequenceEndMessage(3, this.fighter.id, 5));

        setTimeout(function(){
            callback();
        }, movementKeys.length * 200);
    }

    getSpells() {
        var spells = [];
        for(var sId of this.fighter.monster.template.spells) {
            var s = SpellsManager.getSpell(sId);
            var grade = SpellsManager.getSpellLevel(sId, this.fighter.monster.grade.grade);
            if (!grade) {
                grade = SpellsManager.getSpellLevel(sId, 1);
            }
            spells.push({spell: s, grade: grade});
        }
        return spells;
    }

    castBestSpells(target, callback) {
        var spells = this.getSpells();
        var spellCount = 0;
        for(var s of spells) {
            var toCastSpell = s;
            if(toCastSpell && target) {
                if(this.castSpell(toCastSpell.spell, toCastSpell.grade, target.cellId))
                    spellCount++;
            }
        }
        if(spellCount == 0) {
            callback();
            return;
        }
        setTimeout(function(){
            callback();
        }, 1400 * spellCount);
    }

    castSpell(spell, spellLevel, cellId) {
        try {
            if(spellLevel) {
                if (this.fighter.current.AP >= spellLevel.apCost) {
                    if (this.fighter.fight.checkRange(this.fighter, spellLevel, cellId, true)) {
                        this.fighter.current.AP -= spellLevel.apCost;
                        this.fighter.sequenceCount = 1;

                        var effects = spellLevel.effects;

                        this.fighter.fight.send(new Messages.SequenceStartMessage(1, this.fighter.id));
                        this.fighter.fight.send(new Messages.GameActionFightSpellCastMessage(300, this.fighter.id, 0, cellId, false, false, true, spell._id, spellLevel.grade, []));
                        this.fighter.sequenceCount++;
                        this.fighter.fight.send(new Messages.GameActionFightPointsVariationMessage(102, this.fighter.id, this.fighter.id, -(spellLevel.apCost)));
                        this.fighter.sequenceCount++;
                        FightSpellProcessor.process(this.fighter.fight, this.fighter, spell, spellLevel, effects, cellId);
                        this.fighter.fight.send(new Messages.SequenceEndMessage(this.fighter.sequenceCount, this.fighter.id, 1));
                        this.fighter.spellHistory.insertSpell(spellLevel, this.fighter.fight.getFighterOnCell(cellId));
                        return true;
                    }
                }
            }
        }
        catch (e) {
            Logger.error("Can't cast best spell: " + e);
        }
        return false;
    }
}