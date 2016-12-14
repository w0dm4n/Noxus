import Basic from "../../../utils/basic"
import BoostSpellBuff from "../buffs/boost_spell_buff"

export default class BuffSpellBoost {

    static effectId = 293;

    static process(data) {
        for(var t of data.targets) {
            t.addBuff(new BoostSpellBuff(data.effect.diceNum, data.effect.value, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffSpellBoost;