import Basic from "../../../utils/basic"

export default class DamageFire {

    static effectId = 99;
    static elementType = 15;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
            var power = data.caster.getStats().getTotalStats(DamageFire.elementType);
            var damages = (Math.floor(roll * (100 + power + data.caster.getStats().getTotalStats(17)) / 100) + data.caster.getStats().getTotalStats(18));
            t.takeDamage(data.caster, damages, DamageFire.elementType);
        }
    }
}

module.exports = DamageFire;