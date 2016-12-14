import Basic from "../../../utils/basic"
import BoostSpellBuff from "../buffs/boost_spell_buff"

export default class BuffHeal108 {

    static effectId = 108;

    static process(data) {
        for(var t of data.targets) {
            if(data.delay > 0 ){
             var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
             t.addBuff(new BoostSpellBuff(data.effect.diceNum, data.effect.value, data.spell, data.spellLevel, data.effect, data.caster, t));
            }else{
            var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
            t.heal(data.caster,roll,0);
            }
           
        }
    }
}

module.exports = BuffHeal108;