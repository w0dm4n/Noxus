import Basic from "../../../utils/basic"
import HealSpellBuff from "../buffs/heal_spell_buff"
import * as Messages from "../../../io/dofus/messages"
import SpellManager from "../../../game/spell/spell_manager"

export default class BuffInterval1045 {

    static effectId = 1045;

    static process(data) {

        for (var t of data.targets) {

            var getHistorySpell = t.spellHistory.getHistorySpell(data.effect.diceNum);

            if (getHistorySpell == null) {
                var spell = t.character.statsManager.getSpell(data.effect.diceNum).spellLevel;
                var spellLevel = SpellManager.getSpellLevel(data.effect.diceNum,spell); 
                t.spellHistory.insertSpell(spellLevel,t);
                t.spellHistory.spellStack[t.spellHistory.spellStack.length - 1 ].spell.minCastInterval = data.effect.value;

            } else {
                getHistorySpell.round = t.fight.timeline.round;
                getHistorySpell.spell.minCastInterval = data.effect.value;
            }

            t.fight.send(new Messages.GameActionFightSpellCooldownVariationMessage(1035, data.caster.id, t.id, data.effect.diceNum, data.effect.value));

        }
    }
}

module.exports = BuffInterval1045;