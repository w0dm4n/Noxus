import Basic from "../../../utils/basic"
import AddMPBuff from "../buffs/add_mp_buff"

export default class BuffAddMP128 {

    static effectId = 128;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            t.addBuff(new AddMPBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffAddMP128;