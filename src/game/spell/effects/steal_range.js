import Basic from "../../../utils/basic"
import RemoveRangeBuff from "../buffs/remove_range_buff"
import AddRangeBuff from "../buffs/add_range_buff"

export default class stealRange {

    static effectId = 320;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            t.addBuff(new RemoveRangeBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, t));
            data.caster.addBuff(new AddRangeBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));

        }
    }
}

module.exports = stealRange;