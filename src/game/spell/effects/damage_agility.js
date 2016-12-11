import Basic from "../../../utils/basic"

export default class DamageAgility {

    static effectId = 98;
    static elementType = 14;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
            var power = data.caster.getStats().getTotalStats(DamageAgility.elementType);
            var damages = (Math.floor(roll * (100 + power + data.caster.getStats().getTotalStats(17)) / 100) + 0);
            t.takeDamage(data.caster, damages, DamageAgility.elementType);
        }
    }
}

module.exports = DamageAgility;