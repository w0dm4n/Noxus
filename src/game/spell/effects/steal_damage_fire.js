import Basic from "../../../utils/basic"

export default class StealDamageFire {

    static effectId = 94;
    static elementType = 15;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var damages = t.getDamage(data, StealDamageFire.elementType);
            t.takeDamage(data.caster, damages, StealDamageFire.elementType);
            data.caster.heal(data.caster, Math.floor(damages / 2), StealDamageFire.elementType);
        }
    }
}

module.exports = StealDamageFire;