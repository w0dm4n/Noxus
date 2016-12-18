import Basic from "../../../utils/basic"
import AddStatAgilityBuff from "../buffs/add_stat_agility_buff"
import RemoveStatAgilityBuff from "../buffs/remove_stat_agility_buff"

export default class stealStatAgility {

    static effectId = 268;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
            data.caster.addBuff(new AddStatAgilityBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
            t.addBuff(new RemoveStatAgilityBuff(roll, data.spell, data.spellLevel, data.effect, data.caster, data.caster));
        }
    }
}

module.exports = stealStatAgility;