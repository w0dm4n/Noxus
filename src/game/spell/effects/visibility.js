import Basic from "../../../utils/basic"
import MapPoint from "../../pathfinding/map_point"
import InvisibilityBuff from "../buffs/invisibility_buff"
import InvisbilityStateEnum from "../../../enums/invisibility_state_enum"

export default class Visibility {

    static effectId = 202;

    static process(data) {
        data.caster.sequenceCount++;
        for(var t of data.targets) {
            if (t.isInvisible()) {
                t.invisibilityState = InvisbilityStateEnum.VISIBLE;
                t.updateInvisibility(150);
                t.fight.synchronizeFight(t, true);
            }
        }
    }
}

module.exports = Visibility;