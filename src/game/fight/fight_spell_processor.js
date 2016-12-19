import FightShapeProcessor from "./fight_shape_processor"
import Logger from "../../io/logger"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import MapPoint from "../pathfinding/map_point"
import InvisibilityStateEnum from "../../enums/invisibility_state_enum"

export default class FightSpellProcessor {

    static fightEffectsProcessor = null;

    static getEffects(effectId) {
        if (!FightSpellProcessor.fightEffectsProcessor) {
            FightSpellProcessor.fightEffectsProcessor = [];

            var normalizedPath = require("path").join(__dirname, "../spell/effects");
            require("fs").readdirSync(normalizedPath).forEach(function (file) {
                var effect = require("../spell/effects/" + file);
                FightSpellProcessor.fightEffectsProcessor[effect.effectId] = effect;
            });
        }
        return FightSpellProcessor.fightEffectsProcessor[effectId];
    }

    static getValidatorMark() {

    }

    static process(fight, caster, spell, spellLevel, effects, cellId, forcedTarget = null) {

        var randomEffects = [];
        var nEffects = [];
        for (var z in effects) {
            if (effects[z].random > 0) {
                randomEffects.push(effects[z]);
            } else {
                nEffects.push(effects[z]);
            }
        }
        if (randomEffects.length > 0) {
            var round = [];
            var sum = 0, i = 0;
            for (var r in randomEffects) {
                sum += (randomEffects[r].random / 100.0);
                round[r] = sum;
            }
            var rand = Math.random();
            var i;
            for (i = 0; i < round.length && rand >= round[i]; i++);
            nEffects.push(randomEffects[i]);
        }
        var effectsToApply = [];
        for (var e of nEffects) {
            var targetsFactory = this.getTargets(fight, caster, spell, spellLevel, e, cellId, effectsToApply);
            var targets = targetsFactory.targets;
            var shape = targetsFactory.shape;
            var effectProcessor = this.getEffects(e.effectId);
            if (effectProcessor) {
                Logger.debug("Process effect id: " + e.effectId + " of the spellLevel id " + spellLevel._id);
                effectsToApply.push({ effect: e, processor: effectProcessor, targets: targets, shape: shape });
            }
            else {
                console.log(e);
                Logger.error("Effect id: " + e.effectId + " of the spellLevel id " + spellLevel._id + " is not handled yet");
            }
        }
        if (caster.isInvisible())
        {
            for (var toApply of effectsToApply) {
                switch (toApply.effect.effectElement)
                {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        caster.invisibilityState = InvisibilityStateEnum.VISIBLE;
                        caster.updateInvisibility(150);
                        caster.fight.synchronizeFight(caster, true);
                        break;
                    default:
                        caster.fight.send(new Messages.ShowCellMessage(caster.id, caster.cellId));
                        break;
                }

            }
        }

        for (var toApply of effectsToApply) {
            toApply.processor.process({
                fight: fight,
                caster: caster,
                spell: spell,
                spellLevel: spellLevel,
                effect: toApply.effect,
                cellId: cellId,
                targets: (forcedTarget) ? [forcedTarget] : toApply.targets,
                shape: toApply.shape,
            });
        }
    }

    static getTargets(fight, caster, spell, spellLevel, effect, cellId, effectsToApply) {
        var targets = [];
        var point = MapPoint.fromCellId(caster.cellId);
        var directionId = point.orientationTo(MapPoint.fromCellId(cellId));
        var shape = FightShapeProcessor.buildShape(effect.rawZone[0], effect.rawZone[1], cellId, directionId);
        if (shape) {
            for (var cell of shape) {
                var fighterOnCell = fight.getFighterOnCell(cell);
                if (fighterOnCell) targets.push(fighterOnCell);
            }
        }
        var filteredTargets = this.filterTargets(targets, caster, spell, spellLevel, effect, cellId, effectsToApply);
        //TODO: Check if this spell can be casted on a friendly, ennemie etc ..
        //TODO: targetMask: 'a,A'
        return { targets: filteredTargets, shape: shape };
    }

    static filterTargets(targets, caster, spell, spellLevel, effect, cellId, effectsToApply) {
        var masks = effect.targetMask.split(',');
        var filtered = [];
        for (var m of masks) {
            switch (m) {

                case 'a': // All allies
                    for (var t of targets) {
                        if (caster.team.isInThisTeam(t.id)) {
                            filtered.push(t);
                        }
                    }
                    break;

                case 'L':
                case 'A': // Ennemies
                    for (var t of targets) {
                        if (!caster.team.isInThisTeam(t.id)) {
                            filtered.push(t);
                        }
                    }
                    break;

                case 'g': // Allies
                    for (var t of targets) {

                        if (caster.team.isInThisTeam(t.id) && t.id != caster.id) {
                            filtered.push(t);
                        }
                    }
                    break;



                case 'C':
                    filtered.push(caster);
                    break;
                case 'c': // Self
                    var fighter = caster.fight.getFighterOnCell(cellId);
                    if (fighter != null) {
                        if (fighter.id == caster.id) {
                            filtered.push(caster);
                        }
                    }
                    break;
            }
        }

        if (effect.targetMask.indexOf("*") != -1) {
            if (effect.targetMask.indexOf("*e") != -1) {
                if (caster.hasState(parseInt(FightSpellProcessor.getIdState(effect.targetMask, "*e"))) == true) {
                    return [];
                } else {
                    return filtered;
                }
            } else if (effect.targetMask.indexOf("*E") != -1) {
                if (caster.hasState(parseInt(FightSpellProcessor.getIdState(effect.targetMask, "*E"))) == true) {
                    return filtered;
                } else {
                    return [];
                }
            }
        }


        return filtered;
    }

    static getIdState(str, cara) {
        var mark = str.split(',');
        for (var i of mark) {
            var index = i.indexOf(cara);
            if (index != -1) {
                return i.substring(2);
            }
        }
    }
}