import Basic from "../../../utils/basic"
import DamageAgilityBuff from "../buffs/damage_agility_buff"

export default class DamageAgility {

    static effectId = 98;
    static elementType = 14;

    static process(data) {
        for(var t of data.targets) {
            if (data.effect.duration > 0)
            {
                t.addBuff(new DamageAgilityBuff(data, data.spell, data.spellLevel, data.effect, data.caster, t));
            }
            else {
                data.caster.sequenceCount++;
                t.takeDamage(data.caster, t.getDamage(data, DamageAgility.elementType), DamageAgility.elementType);
            }
        }
    }
}

module.exports = DamageAgility;