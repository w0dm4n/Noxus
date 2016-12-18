import Basic from "../../../utils/basic"
import MapPoint from "../../pathfinding/map_point"
import InvisibilityBuff from "../buffs/invisibility_buff"

export default class Invisiblity {

    static effectId = 150;

    static process(data) {
        data.caster.sequenceCount++;
        for(var t of data.targets) {
            t.addBuff(new InvisibilityBuff(data, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = Invisiblity;