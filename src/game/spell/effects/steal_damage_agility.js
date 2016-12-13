import Basic from "../../../utils/basic"

export default class StealDamageAgility {

    static effectId = 93;
    static elementType = 14;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
            var power = data.caster.getStats().getTotalStats(StealDamageAgility.elementType);
            var damages = (Math.floor((roll * (100 + power + data.caster.getStats().getTotalStats(17)) / 100)) + data.caster.getStats().getTotalStats(18));
            t.takeDamage(data.caster, damages, StealDamageAgility.elementType);
            data.caster.heal(data.caster, Math.floor(damages / 2), StealDamageAgility.elementType);
        }
    }
}

module.exports = StealDamageAgility;