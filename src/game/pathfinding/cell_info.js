export default class CellInfo {
    constructor(cell, mapPoint) {
        this.cell = cell;
        this.mapPoint = mapPoint;
        this.id = this.cell.id;
        this.parent = this;
        this.available = this.cell._mov;
        if(!this.available) {
            if(this.cell._nonWalkableDuringFight) {
                this.available = false;
            }
        }
        this.x = mapPoint.x;
        this.y = mapPoint.y;
        this.f = 0;
        this.g = 0;
        this.h = 0;
    }
}