import Basic from "../../../utils/basic"
import DamageNeutralBuff from "../buffs/damage_neutral_buff"

export default class DamageNeutral {

    static effectId = 100;
    static elementType = 10;

    static process(data) {
        for(var t of data.targets) {
            if (data.effect.duration > 0)
            {
                t.addBuff(new DamageNeutralBuff(data, data.spell, data.spellLevel, data.effect, data.caster, t));
            }
            else {
                data.caster.sequenceCount++;
                t.takeDamage(data.caster, t.getDamage(data, DamageNeutral.elementType), DamageNeutral.elementType);
            }
        }
    }
}

module.exports = DamageNeutral;