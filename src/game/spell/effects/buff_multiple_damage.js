import MultipleDamage from "../buffs/add_multiple_damage"

export default class BuffMultipleDamage{
    static effectId = 1163;

    static process(data) {
        for(var t of data.targets) {
            t.addBuff(new MultipleDamage(data.effect.diceNum,data.spell, data.spellLevel, data.effect, data.caster, data.caster));
        }
    }
}
module.exports = BuffMultipleDamage;