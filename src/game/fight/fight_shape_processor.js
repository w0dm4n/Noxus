import MapPoint from "../pathfinding/map_point"
import DirectionsEnum from "../pathfinding/directions_enum"

export default class FightShapeProcessor {
    static shapes = {
        "P": FightShapeProcessor.P_shape, // Default
        "C": FightShapeProcessor.C_shape, // Lozenge
        "X": FightShapeProcessor.X_shape, // Cross
        "T": FightShapeProcessor.T_shape, // Cross
    }

    static buildShape(shapeId, radius, cellId, directionId) {
        var shape = FightShapeProcessor.shapes[shapeId];
        if(shape) {
            var cells = shape(cellId, parseInt(radius), directionId)
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

    static X_shape(cellId, radius) {
        var cross = new Cross(0, radius);
        return cross.getCells(cellId);
    }

    static T_shape(cellId, radius, directionId) {
        var cross = new Cross(0, radius);
        cross.onlyPerpendicular = true;
        cross._direction = directionId;
        return cross.getCells(cellId);
    }
}

class Cross {

    constructor(param1, param2) {
        this._minRadius = param1;
        this._radius = param2;
        this._diagonal = false;
        this._allDirections = false;
        this._direction = 0;
        this.disabledDirection = [];
        this.onlyPerpendicular = false;
    }

    getCells(param1) {
        var _loc2_ = [];
        if(this._minRadius == 0)
        {
            _loc2_.push(param1);
        }
        if(this.onlyPerpendicular)
        {
            switch(this._direction)
            {
                case DirectionsEnum.DOWN_RIGHT:
                case DirectionsEnum.UP_LEFT:
                    this.disabledDirection = [DirectionsEnum.DOWN_RIGHT,DirectionsEnum.UP_LEFT];
                    break;
                case DirectionsEnum.UP_RIGHT:
                case DirectionsEnum.DOWN_LEFT:
                    this.disabledDirection = [DirectionsEnum.UP_RIGHT,DirectionsEnum.DOWN_LEFT];
                    break;
                case DirectionsEnum.DOWN:
                case DirectionsEnum.UP:
                    this.disabledDirection = [DirectionsEnum.DOWN,DirectionsEnum.UP];
                    break;
                case DirectionsEnum.RIGHT:
                case DirectionsEnum.LEFT:
                    this.disabledDirection = [DirectionsEnum.RIGHT,DirectionsEnum.LEFT];
            }
        }
        var _loc3_ = MapPoint.fromCellId(param1);
        var _loc4_ = _loc3_.x;
        var _loc5_ = _loc3_.y;
        var _loc6_ = this._radius;
        while(_loc6_ > 0)
        {
            if(_loc6_ >= this._minRadius)
            {
                if(!this._diagonal)
                {
                    if(MapPoint.isInMap(_loc4_ + _loc6_,_loc5_) && this.disabledDirection.indexOf(DirectionsEnum.DOWN_RIGHT) == -1)
                    {
                        this.addCell(_loc4_ + _loc6_,_loc5_,_loc2_);
                    }
                    if(MapPoint.isInMap(_loc4_ - _loc6_,_loc5_) && this.disabledDirection.indexOf(DirectionsEnum.UP_LEFT) == -1)
                    {
                        this.addCell(_loc4_ - _loc6_,_loc5_,_loc2_);
                    }
                    if(MapPoint.isInMap(_loc4_,_loc5_ + _loc6_) && this.disabledDirection.indexOf(DirectionsEnum.UP_RIGHT) == -1)
                    {
                        this.addCell(_loc4_,_loc5_ + _loc6_,_loc2_);
                    }
                    if(MapPoint.isInMap(_loc4_,_loc5_ - _loc6_) && this.disabledDirection.indexOf(DirectionsEnum.DOWN_LEFT) == -1)
                    {
                        this.addCell(_loc4_,_loc5_ - _loc6_,_loc2_);
                    }
                }
                if(this._diagonal || this._allDirections)
                {
                    if(MapPoint.isInMap(_loc4_ + _loc6_,_loc5_ - _loc6_) && this.disabledDirection.indexOf(DirectionsEnum.DOWN) == -1)
                    {
                        this.addCell(_loc4_ + _loc6_,_loc5_ - _loc6_,_loc2_);
                    }
                    if(MapPoint.isInMap(_loc4_ - _loc6_,_loc5_ + _loc6_) && this.disabledDirection.indexOf(DirectionsEnum.UP) == -1)
                    {
                        this.addCell(_loc4_ - _loc6_,_loc5_ + _loc6_,_loc2_);
                    }
                    if(MapPoint.isInMap(_loc4_ + _loc6_,_loc5_ + _loc6_) && this.disabledDirection.indexOf(DirectionsEnum.RIGHT) == -1)
                    {
                        this.addCell(_loc4_ + _loc6_,_loc5_ + _loc6_,_loc2_);
                    }
                    if(MapPoint.isInMap(_loc4_ - _loc6_,_loc5_ - _loc6_) && this.disabledDirection.indexOf(DirectionsEnum.LEFT) == -1)
                    {
                        this.addCell(_loc4_ - _loc6_,_loc5_ - _loc6_,_loc2_);
                    }
                }
            }
            _loc6_--;
        }
        return _loc2_;
    }

    addCell(param1, param2, param3) {
        param3.push(MapPoint.fromCoords(param1,param2)._nCellId);
    }
}