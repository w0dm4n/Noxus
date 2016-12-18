import Basic from "../../../utils/basic"
import addStatStrengthBuff from "../buffs/add_stat_strength_buff"
import RemoveStatStrengthBuff from "../buffs/remove_stat_strength_buff"

export default class stealStatStrength {

    static effectId = 271;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            data.caster.addBuff(new addStatStrengthBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
            t.addBuff(new RemoveStatStrengthBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
        }
    }
}

module.exports = stealStatStrength;