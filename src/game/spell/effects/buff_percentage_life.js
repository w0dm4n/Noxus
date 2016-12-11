import Basic from "../../../utils/basic"
import AddVitalityBuff from "../buffs/add_vitality_buff"

export default class BuffPercentageLife {

    static effectId = 1078;

    static process(data) {
        data.caster.sequenceCount++;
        var buffPercentage = data.effect.diceNum;
        for(var t of data.targets) {
            t.addBuff(new AddVitalityBuff(Basic.getPercentage(buffPercentage, t.getStats().getMaxLife()),
                data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffPercentageLife;