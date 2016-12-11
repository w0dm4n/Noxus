import FightShapeProcessor from "./fight_shape_processor"
import Logger from "../../io/logger"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"

export default class FightSpellProcessor {

    static fightEffectsProcessor = null;

    static getEffects(effectId) {
        if(!FightSpellProcessor.fightEffectsProcessor) {
            FightSpellProcessor.fightEffectsProcessor = [];

            var normalizedPath = require("path").join(__dirname, "../spell/effects");
            require("fs").readdirSync(normalizedPath).forEach(function(file) {
                var effect = require("../spell/effects/" + file);
                FightSpellProcessor.fightEffectsProcessor[effect.effectId] = effect;
            });
        }
        return FightSpellProcessor.fightEffectsProcessor[effectId];
    }

    static process(fight, caster, spell, spellLevel, effects, cellId) {
        for(var e of effects) {
            var targets = this.getTargets(fight, caster, spell, spellLevel, e, cellId);
            var effectProcessor = this.getEffects(e.effectId);
            console.log(e);
            if(effectProcessor) {
                Logger.debug("Process effect id: " + e.effectId + " of the spellLevel id " + spellLevel._id);
                effectProcessor.process({
                    fight: fight,
                    caster: caster,
                    spell: spell,
                    spellLevel: spellLevel,
                    effect: e,
                    cellId: cellId,
                    targets: targets
                });
            }
            else {
                Logger.error("Effect id: " + e.effectId + " of the spellLevel id " + spellLevel._id + " is not handled yet");
            }
        }
    }

    static getTargets(fight, caster, spell, spellLevel, effect, cellId) {
        var targets = [];
        var shape = FightShapeProcessor.buildShape(effect.rawZone[0], effect.rawZone[1], cellId);
        if(shape) {
            for(var cell of shape) {
                var fighterOnCell = fight.getFighterOnCell(cell);
                if(fighterOnCell) targets.push(fighterOnCell);
            }
        }
        var filteredTargets = this.filterTargets(targets, caster, spell, spellLevel, effect, cellId);
        //TODO: Check if this spell can be casted on a friendly, ennemie etc ..
        //TODO: targetMask: 'a,A'
        return filteredTargets;
    }

    static filterTargets(targets, caster, spell, spellLevel, effect, cellId) {
        var masks = effect.targetMask.split(',');
        var filtered = [];
        for(var m of masks) {
            switch (m) {
                case 'a': // All allies
                    for(var t of targets) {
                        if(caster.team.isInThisTeam(t.id)) {
                            filtered.push(t);
                        }
                    }
                    break;

                case 'A': // Ennemies
                    for(var t of targets) {
                        if(!caster.team.isInThisTeam(t.id)) {
                            filtered.push(t);
                        }
                    }
                    break;

                case 'g': // Allies
                    for(var t of targets) {
                        if(caster.team.isInThisTeam(t.id) && t.id != caster.id) {
                            filtered.push(t);
                        }
                    }
                    break;

                case 'c': // Self
                    filtered.push(caster);
                    break;
            }
        }
        return filtered;
    }
}