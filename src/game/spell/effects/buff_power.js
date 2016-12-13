import Basic from "../../../utils/basic"
import AddPowerBuff from "../buffs/add_power_buff"

export default class BuffPower {

    static effectId = 138;

    static process(data) {
        data.caster.sequenceCount++;
        var buffPercentage = data.effect.diceNum;
        for(var t of data.targets) {
            t.addBuff(new AddPowerBuff(buffPercentage, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffPower;