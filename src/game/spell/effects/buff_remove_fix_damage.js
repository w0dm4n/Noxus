import Basic from "../../../utils/basic"
import RemoveFixDamageBuff from "../buffs/remove_fix_damage_buff"

export default class BuffRemoveFixDamage {

    static effectId = 145;

    static process(data) {
        data.caster.sequenceCount++;
        var buffPercentage = data.effect.diceNum;
        for(var t of data.targets) {
            t.addBuff(new RemoveFixDamageBuff(buffPercentage, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = BuffRemoveFixDamage;