import Basic from "../../../utils/basic"
import MapPoint from "../../pathfinding/map_point"

export default class Attraction {

    static effectId = 6;

    static process(data) {
        for(var t of data.targets) {
            data.caster.sequenceCount++;
            var point = MapPoint.fromCellId(data.caster.cellId);
            var dir = point.orientationTo(MapPoint.fromCellId(t.cellId));
            t.attract(dir, data, 550);
        }
    }
}

module.exports = Attraction;