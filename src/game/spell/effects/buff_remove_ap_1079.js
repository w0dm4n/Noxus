import Basic from "../../../utils/basic"
import RemoveAPBuff from "../buffs/remove_ap_buff"

export default class BuffRemoveAp1079 {

    static effectId = 1079;

    static process(data) {
        for(var t of data.targets) {
            if(t.alive){
                var roll = 0;
                roll = (data.effect.diceSide > 0) ? Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide) : data.effect.diceNum;
                t.looseAP(data, roll);
            }              
        }
    }
}

module.exports = BuffRemoveAp1079;