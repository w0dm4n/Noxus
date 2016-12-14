import Basic from "../../../utils/basic"

export default class DamageAgility {

    static effectId = 98;
    static elementType = 14;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            t.takeDamage(data.caster, t.getDamage(data, DamageAgility.elementType), DamageAgility.elementType);
        }
    }
}

module.exports = DamageAgility;