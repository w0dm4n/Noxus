import CellInfo from './cell_info'
import MapPoint from './map_point'

export default class Pathfinding {

    constructor(map) {
        this.map = map;
        this.CELL_DISTANCE_VALUE = 15;
        this.cells = new Array();
        this.openList = new Array();
        this.closedList = new Array();
        this.fightMode = false;

        for (var i in this.map.cells) {
            var cell = new CellInfo(this.map.cells[i], MapPoint.fromCellId(this.map.cells[i].id));
            this.cells.push(cell);
        }
    }

    getCell(id) {
        for (var i in this.cells) {
            if (this.cells[i].id == id) {
                return this.cells[i];
            }
        }
        return null;
    }

    getNeighbours(cell, dyn) {
        var neigh = cell.mapPoint.getNearestCells(this.fightMode);
        var cells = [];
        for (var i in neigh) {
            var n = neigh[i];
            if (n != null) {
                if (dyn) {
                    if (dyn.indexOf(n._nCellId) == -1 && this.isAvailableCell(n._nCellId)) {
                        cells.push(this.getCell(n._nCellId));
                    }
                }
            }
        }
        return cells;
    }

    isAvailableCell(cellId) {
        var cell = this.getCell(cellId);
        if (cell == null) return false;
        return cell.available;
    }


    findShortestPath(startCell, endCell, dynObstacles) {
        const Graph = require('node-dijkstra')
        const route = new Graph()

        for(var cell of this.cells) {
            var neight = this.getNeighbours(cell, dynObstacles);
            var graphNode = {};
            for(var n of neight) {
                graphNode[n.id.toString()] = 1;
            }
            route.addNode(cell.id.toString(), graphNode);
        }
        var path = route.path(startCell.toString(), endCell.toString());
        var keys = [];
        for(var c of path) {
            keys.push(parseInt(c));
        }
        return keys;
    }
}