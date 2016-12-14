import Basic from "../../../utils/basic"

export default class StealDamageLuck {

    static effectId = 91;
    static elementType = 13;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var damages = t.getDamage(data, StealDamageLuck.elementType);
            t.takeDamage(data.caster, damages, StealDamageLuck.elementType);
            data.caster.heal(data.caster, Math.floor(damages / 2), StealDamageLuck.elementType);
        }
    }
}

module.exports = StealDamageLuck;