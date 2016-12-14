import Basic from "../../../utils/basic"

export default class DamageFire {

    static effectId = 99;
    static elementType = 15;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            t.takeDamage(data.caster, t.getDamage(data, DamageFire.elementType), DamageFire.elementType);
        }
    }
}

module.exports = DamageFire;