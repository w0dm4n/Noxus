import Basic from "../../../utils/basic"

export default class DamageLuck {

    static effectId = 96;
    static elementType = 13;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            t.takeDamage(data.caster, t.getDamage(data, DamageLuck.elementType), DamageLuck.elementType);
        }
    }
}

module.exports = DamageLuck;