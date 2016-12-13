import Basic from "../../../utils/basic"

export default class DamageStrength {

    static effectId = 97;
    static elementType = 10;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
            var power = data.caster.getStats().getTotalStats(DamageStrength.elementType);
            var damages = (Math.floor((roll * (100 + power + data.caster.getStats().getTotalStats(17)) / 100)) + data.caster.getStats().getTotalStats(18));
            t.takeDamage(data.caster, damages, DamageStrength.elementType);
        }
    }
}

module.exports = DamageStrength;