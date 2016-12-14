import Basic from "../../../utils/basic"
import RemoveRangeBuff from "../buffs/remove_range_buff"
import AddMPBuff from "../buffs/add_mp_buff"

export default class stealMP {

    static effectId = 77;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            //t.addBuff(new RemoveRangeBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, t));
            var lostMP = t.looseMP(data, roll);
            if (lostMP > 0) {
                data.caster.addBuff(new AddMPBuff(lostMP, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
            }

        }
    }
}

module.exports = stealMP;