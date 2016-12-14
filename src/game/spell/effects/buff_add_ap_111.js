import Basic from "../../../utils/basic"
import AddAPBuff from "../buffs/add_ap_buff"

export default class BuffAddAP111 {

    static effectId = 111;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            t.addBuff(new AddAPBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffAddAP111;