import Basic from "../../../utils/basic"
import AddCriticalBuff from "../buffs/add_critical_buff"

export default class BuffAddCritical {

    static effectId = 115;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            t.addBuff(new AddCriticalBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffAddCritical;