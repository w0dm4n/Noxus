import Basic from "../../../utils/basic"
import MapPoint from "../../pathfinding/map_point"

export default class Push {

    static effectId = 5;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var point = MapPoint.fromCellId(data.caster.cellId);
            var dir = point.orientationTo(MapPoint.fromCellId(t.cellId));
            t.push(dir, data.effect.diceNum);
        }
    }
}

module.exports = Push;