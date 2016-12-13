import Basic from "../../../utils/basic"

export default class BuffRemoveAP1079 {

    static effectId = 1079;

    static process(data) {
        for(var t of data.targets) {
            var roll = 0;
            roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
                t.looseAP(data, roll);
        }
    }
}

module.exports = BuffRemoveAP1079;