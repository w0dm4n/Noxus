import MapPoint from "../pathfinding/map_point"

export default class FightShapeProcessor {
    static shapes = {
        "P": FightShapeProcessor.P_shape, // Default
        "C": FightShapeProcessor.C_shape, // Lozenge
        "X": FightShapeProcessor.X_shape, // Cross
    }

    static buildShape(shapeId, radius, cellId) {
        var shape = FightShapeProcessor.shapes[shapeId];
        if(shape) {
            var cells = shape(cellId, radius)
            return cells;
        }
        else {
            return null;
        }
    }

    static P_shape(cellId) {
        return [cellId];
    }

    static C_shape(param1, radius) {
        var _minRadius = 0;
        var _loc6_ = 0;
        var _loc7_ = 0;
        var _loc2_ = [];
        var _loc3_ = MapPoint.fromCellId(param1);
        var _loc4_ = _loc3_.x;
        var _loc5_ = _loc3_.y;
        if(radius == 0)
        {
            _loc2_.push(param1);
            return _loc2_;
        }
        var _loc8_ = 1;
        var _loc9_ = 0;
        _loc6_ = _loc4_ - radius;
        while(_loc6_ <= _loc4_ + radius)
        {
            _loc7_ = -_loc9_;
            while(_loc7_ <= _loc9_)
            {
                if(!_minRadius || Math.abs(_loc4_ - _loc6_) + Math.abs(_loc7_) >= _minRadius)
                {
                    if(MapPoint.isInMap(_loc6_,_loc7_ + _loc5_))
                    {
                        _loc2_.push(MapPoint.fromCoords(_loc6_,_loc7_ + _loc5_)._nCellId);
                    }
                }
                _loc7_++;
            }
            if(_loc9_ == radius)
            {
                _loc8_ = -_loc8_;
            }
            _loc9_ = _loc9_ + _loc8_;
            _loc6_++;
        }
        return _loc2_;
    }

    static X_shape(cellId) {
        return [cellId];
    }
}