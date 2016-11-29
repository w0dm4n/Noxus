export default class DataMapProvider {

    constructor(map) {
        this.map = map;
    }

    getCell(cellId) {
        for(var i in this.map.cells) {
            if(this.map.cells[i].id == cellId) return this.map.cells[i];
        }
        return null;
    }

    getCellSpeed(cellId) {
        return this.getCell(cellId).speed;
    }

    getCellSpeed(cellId) {
        return this.getCell(cellId).speed;
    }

    get cells() {
        return this.map.cells;
    }
}