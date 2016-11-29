import Point from './point';
import DirectionsEnum from './directions_enum'

export default class MapPoint {
    static VECTOR_RIGHT = new Point(1,1);
    static VECTOR_DOWN_RIGHT = new Point(1,0);
    static VECTOR_DOWN = new Point(1,-1);
    static VECTOR_DOWN_LEFT = new Point(0,-1);
    static VECTOR_LEFT = new Point(-1,-1);
    static VECTOR_UP_LEFT = new Point(-1,0);
    static VECTOR_UP = new Point(-1,1);
    static VECTOR_UP_RIGHT = new Point(0,1);
    static MAP_WIDTH = 14;
    static MAP_HEIGHT = 20;
    static _bInit = false;
    static CELLPOS = new Array();

    _nCellId = 0;
    _nX = 0;
    _nY = 0;
       
    constructor() {

    }

    static fromCellId(param1)
    {
        var _loc2_ = new MapPoint();
        _loc2_._nCellId = param1;
        _loc2_.setFromCellId();
        return _loc2_;
    }
    
    static fromCoords(param1, param2)
    {
        var _loc3_ = new MapPoint();
        _loc3_._nX = param1;
        _loc3_._nY = param2;
        _loc3_.setFromCoords();
        return _loc3_;
    }
    
    static getOrientationsDistance(param1, param2)
    {
        return Math.min(Math.abs(param2 - param1),Math.abs(8 - param2 + param1));
    }
    
    static isInMap(param1, param2)
    {
        return param1 + param2 >= 0 && param1 - param2 >= 0 && param1 - param2 < MapPoint.MAP_HEIGHT * 2 && param1 + param2 < MapPoint.MAP_WIDTH * 2;
    }

    static init()
    {
        var _loc4_ = 0;
        MapPoint._bInit = true;
        var _loc1_ = 0;
        var _loc2_ = 0;
        var _loc3_ = 0;
        var _loc5_ = 0;
        while(_loc5_ < MapPoint.MAP_HEIGHT)
        {
        _loc4_ = 0;
        while(_loc4_ < MapPoint.MAP_WIDTH)
        {
            MapPoint.CELLPOS[_loc3_] = new Point(_loc1_ + _loc4_,_loc2_ + _loc4_);
            _loc3_++;
            _loc4_++;
        }
        _loc1_++;
        _loc4_ = 0;
        while(_loc4_ < MapPoint.MAP_WIDTH)
        {
            MapPoint.CELLPOS[_loc3_] = new Point(_loc1_ + _loc4_,_loc2_ + _loc4_);
            _loc3_++;
            _loc4_++;
        }
        _loc2_--;
        _loc5_++;
        }
    }

    get x()
    {
        return this._nX;
    }
      
    set x(param1)
    {
        this._nX = param1;
        this.setFromCoords();
    }
    
    get y()
    {
        return this._nY;
    }
    
    set y(param1)
    {
        this._nY = param1;
        this.setFromCoords();
    }

    get coordinates()
    {
        return new Point(this._nX,this._nY);
    }

    distanceTo(param1)
    {
        return parseInt(Math.sqrt(Math.pow(param1.x - this.x,2) + Math.pow(param1.y - this.y,2)));
    }

    distanceToCell(param1)
    {
        return parseInt(Math.abs(this.x - param1.x) + Math.abs(this.y - param1.y));
    }

    orientationTo(param1)
    {
        var _loc3_ = 0;
        if(this.x == param1.x && this.y == param1.y)
        {
        return 1;
        }
        var _loc2_ = new Point();
        _loc2_.x = param1.x > this.x?1:param1.x < this.x?-1:0;
        _loc2_.y = param1.y > this.y?1:param1.y < this.y?-1:0;
        if(_loc2_.x == MapPoint.VECTOR_RIGHT.x && _loc2_.y == MapPoint.VECTOR_RIGHT.y)
        {
        _loc3_ = DirectionsEnum.RIGHT;
        }
        else if(_loc2_.x == MapPoint.VECTOR_DOWN_RIGHT.x && _loc2_.y == MapPoint.VECTOR_DOWN_RIGHT.y)
        {
        _loc3_ = DirectionsEnum.DOWN_RIGHT;
        }
        else if(_loc2_.x == MapPoint.VECTOR_DOWN.x && _loc2_.y == MapPoint.VECTOR_DOWN.y)
        {
        _loc3_ = DirectionsEnum.DOWN;
        }
        else if(_loc2_.x == MapPoint.VECTOR_DOWN_LEFT.x && _loc2_.y == MapPoint.VECTOR_DOWN_LEFT.y)
        {
        _loc3_ = DirectionsEnum.DOWN_LEFT;
        }
        else if(_loc2_.x == MapPoint.VECTOR_LEFT.x && _loc2_.y == MapPoint.VECTOR_LEFT.y)
        {
        _loc3_ = DirectionsEnum.LEFT;
        }
        else if(_loc2_.x == MapPoint.VECTOR_UP_LEFT.x && _loc2_.y == MapPoint.VECTOR_UP_LEFT.y)
        {
        _loc3_ = DirectionsEnum.UP_LEFT;
        }
        else if(_loc2_.x == MapPoint.VECTOR_UP.x && _loc2_.y == MapPoint.VECTOR_UP.y)
        {
        _loc3_ = DirectionsEnum.UP;
        }
        else if(_loc2_.x == MapPoint.VECTOR_UP_RIGHT.x && _loc2_.y == MapPoint.VECTOR_UP_RIGHT.y)
        {
        _loc3_ = DirectionsEnum.UP_RIGHT;
        }
        return _loc3_;
    }

    getNearestFreeCell(param1, param2 = true)
    {
        var _loc3_ = null;
        var _loc4_ = 0;
        while(_loc4_ < 8)
        {
        _loc3_ = this.getNearestFreeCellInDirection(_loc4_,param1,false,param2);
        if(_loc3_)
        {
            break;
        }
        _loc4_++;
        }
        return _loc3_;
    }

    getNearestCells()
    {
        var _loc3_ = null;
        var _loc4_ = 0;
        var result = [];
        while(_loc4_ < 8)
        {
        _loc3_ = this.getNearestCellInDirection(_loc4_);
        result.push(_loc3_);
        _loc4_++;
        }
        return result;
    }

    getNearestCellInDirection(param1)
    {
        var _loc2_ = null;
        switch(param1)
        {
        case 0:
            _loc2_ = MapPoint.fromCoords(this._nX + 1,this._nY + 1);
            break;
        case 1:
            _loc2_ = MapPoint.fromCoords(this._nX + 1,this._nY);
            break;
        case 2:
            _loc2_ = MapPoint.fromCoords(this._nX + 1,this._nY - 1);
            break;
        case 3:
            _loc2_ = MapPoint.fromCoords(this._nX,this._nY - 1);
            break;
        case 4:
            _loc2_ = MapPoint.fromCoords(this._nX - 1,this._nY - 1);
            break;
        case 5:
            _loc2_ = MapPoint.fromCoords(this._nX - 1,this._nY);
            break;
        case 6:
            _loc2_ = MapPoint.fromCoords(this._nX - 1,this._nY + 1);
            break;
        case 7:
            _loc2_ = MapPoint.fromCoords(this._nX,this._nY + 1);
        }
        if(MapPoint.isInMap(_loc2_._nX,_loc2_._nY))
        {
        return _loc2_;
        }
        return null;
    }

    setFromCoords()
    {
        if(!MapPoint._bInit)
        {
        this.init();
        }
        this._nCellId = parseInt((this._nX - this._nY) * MapPoint.MAP_WIDTH + this._nY + (this._nX - this._nY) / 2);
    }
    
    setFromCellId()
    {
        if(!MapPoint._bInit)
        {
        MapPoint.init();
        }
        var _loc1_ = MapPoint.CELLPOS[this._nCellId];
        this._nX = _loc1_.x;
        this._nY = _loc1_.y;
    }
}