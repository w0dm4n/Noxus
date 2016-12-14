import FightShapeProcessor from "./fight_shape_processor"
import Logger from "../../io/logger"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import MapPoint from "../pathfinding/map_point"

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

    static getValidatorMark()
    {

    }

    static process(fight, caster, spell, spellLevel, effects, cellId) {

        var randomEffects = [];
        var nEffects = [];
        for (var z in effects) {
            if (effects[z].random > 0) {
                randomEffects.push(effects[z]);
            }else{
              nEffects.push(effects[z]);
            }
        }
        if (randomEffects.length > 0) {
            var round = [];
            var sum = 0 , i = 0;
            for (var r in randomEffects) {
                sum += (randomEffects[r].random / 100.0);
                round[r] = sum;
            }
            var rand = Math.random();
            var i;
            for (i=0 ; i<round.length && rand>=round[i] ; i++);
            nEffects.push(randomEffects[i]);
        }
        var effectsToApply = [];
        for (var e of nEffects) {
            var targets = this.getTargets(fight, caster, spell, spellLevel, e, cellId, effectsToApply);
            var effectProcessor = this.getEffects(e.effectId);
            if (effectProcessor) {
                Logger.debug("Process effect id: " + e.effectId + " of the spellLevel id " + spellLevel._id);
                effectsToApply.push({effect: e, processor: effectProcessor, targets: targets});
            }
            else {
                console.log(e);
                Logger.error("Effect id: " + e.effectId + " of the spellLevel id " + spellLevel._id + " is not handled yet");
            }
        }

        for(var toApply of effectsToApply) {
            toApply.processor.process({
                fight: fight,
                caster: caster,
                spell: spell,
                spellLevel: spellLevel,
                effect: toApply.effect,
                cellId: cellId,
                targets: toApply.targets
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
        return filteredTargets;
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
                case 'c': // Self
                    filtered.push(caster);
                    break;
            }
        }
        // juste pour test
        var index = effect.targetMask.indexOf("*e");
        if(index != -1)
        {
            if(caster.hasState(parseInt(FightSpellProcessor.getIdState(effect.targetMask,"*e"))) == true)
            {
                return [];    
            }
        }

       /* var indexE = effect.targetMask.indexOf("*E");
        if(indexE != -1)
        {
            if(!caster.hasState(FightSpellProcessor.getIdState(effect.targetMask,"*E")) == true)
            {
                return [];    
            }
        }*/

        return filtered;
    }

    static getIdState(str,cara){
        var mark = str.split(',');
        for(var i of mark){
            var index = i.indexOf(cara);
            if(index != -1){
                return i.substring(2);
            }
        }
    }
}