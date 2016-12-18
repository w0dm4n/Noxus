import Basic from "../../../utils/basic"
import HealSpellBuff from "../buffs/heal_spell_buff"

export default class BuffHeal108 {

    static effectId = 108;

    static process(data) {
        var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
        for (var t of data.targets) {
            if (data.effect.delay > 0) {
                t.addBuff(new HealSpellBuff(data.spell.spellId, roll, data.spell, data.spellLevel, data.effect, data.caster, t));
            } else {
                t.heal(data.caster, roll, 0);
            }

        }
    }
}

module.exports = BuffHeal108;