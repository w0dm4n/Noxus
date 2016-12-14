import Basic from "../../../utils/basic"

export default class DamageStrength {

    static effectId = 97;
    static elementType = 10;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            t.takeDamage(data.caster, t.getDamage(data, DamageStrength.elementType), DamageStrength.elementType);
        }
    }
}

module.exports = DamageStrength;