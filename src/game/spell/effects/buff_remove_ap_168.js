import Basic from "../../../utils/basic"
import RemoveApBuff from "../buffs/remove_ap_buff_fix"

export default class BuffRemoveAP168 {

    static effectId = 168;

    static process(data) {
        for(var t of data.targets) {
            t.addBuff(new RemoveApBuff(data.effect.diceNum, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffRemoveAP168;