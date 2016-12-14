import Basic from "../../../utils/basic"

export default class StealDamageAgility {

    static effectId = 93;
    static elementType = 14;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var damages = t.getDamage(data, StealDamageAgility.elementType);
            t.takeDamage(data.caster, damages, StealDamageAgility.elementType);
            data.caster.heal(data.caster, Math.floor(damages / 2), StealDamageAgility.elementType);
        }
    }
}

module.exports = StealDamageAgility;