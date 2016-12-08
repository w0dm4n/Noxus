import Basic from "../../../utils/basic"

export default class DamageFire {

    static effectId = 99;
    static elementType = 15;

    static process(data) {
        var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
        var power = data.caster.getStats().getTotalStats(DamageFire.elementType);
        var damages = (Math.floor(roll * (100 + power + 0) / 100) + 0);
        data.target.takeDamage(data.caster, damages, DamageFire.elementType);
    }
}

module.exports = DamageFire;