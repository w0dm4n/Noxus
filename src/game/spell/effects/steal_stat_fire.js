import Basic from "../../../utils/basic"
import AddStatFireBuff from "../buffs/add_stat_fire_buff"
import RemoveStatFireBuff from "../buffs/remove_stat_fire_buff"

export default class stealStatFire {

    static effectId = 269;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            data.caster.addBuff(new AddStatFireBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
            t.addBuff(new RemoveStatFireBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
        }
    }
}

module.exports = stealStatFire;