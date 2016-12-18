import Basic from "../../../utils/basic"
import RemoveMpBuff from "../buffs/remove_mp_buff"

export default class BuffRemoveMp1080 {

    static effectId = 1080;

    static process(data) {
        for(var t of data.targets) {
            if(t.alive){
                var roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
                t.looseMP(data, roll);
            }
              
        }
    }
}

module.exports = BuffRemoveMp1080;