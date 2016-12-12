import Basic from "../../../utils/basic"

export default class DamageLuck {

    static effectId = 96;
    static elementType = 13;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
            var power = data.caster.getStats().getTotalStats(DamageLuck.elementType);
            var damages = (Math.floor(roll * (100 + power + data.caster.getStats().getTotalStats(17)) / 100) + data.caster.getStats().getTotalStats(18));
            t.takeDamage(data.caster, damages, DamageLuck.elementType);
        }
    }
}

module.exports = DamageLuck;