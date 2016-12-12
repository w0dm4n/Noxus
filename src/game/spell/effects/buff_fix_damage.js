import Basic from "../../../utils/basic"
import AddDamageFixBuff from "../buffs/add_damage_fix_buff"

export default class BuffFixDamage {

    static effectId = 112;

    static process(data) {
        data.caster.sequenceCount++;
        var buffPercentage = data.effect.diceNum;
        for(var t of data.targets) {
            t.addBuff(new AddDamageFixBuff(buffPercentage, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffFixDamage;