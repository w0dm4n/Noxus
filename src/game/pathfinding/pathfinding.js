import CellInfo from './cell_info'
import MapPoint from './map_point'

export default class Pathfinding {

    constructor(map) {
        this.map = map;
        this.CELL_DISTANCE_VALUE = 10;
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

    addToCloseList(cell) {
        this.closedList.push(cell);
        if (this.openList.indexOf(cell) != -1) {
            this.openList.splice(this.openList.indexOf(cell));
        }
    }

    addToOpenList(cell) {
        this.openList.push(cell);
        if (this.closedList.indexOf(cell) != -1) {
            this.closedList.splice(this.closedList.indexOf(cell));
        }
    }

    getCurrentNode() {
        var tmpList = new Array();
        var maximum = this.openList.length;
        var minF = 1000000;
        var curNode = null;
        for (var i = 0; i < maximum; i++) {
            var node = this.openList[i];
            if (node.f < minF) {
                minF = node.f;
                curNode = node;
            }
        }
        return curNode;
    }

    getNeighbours(cell, dyn) {
        var neigh = cell.mapPoint.getNearestCells(this.fightMode);
        var cells = [];
        for (var i in neigh) {
            var n = neigh[i];
            if (n != null) {
                if (dyn) {
                    if (dyn.indexOf(n._nCellId) == -1) {
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

    static findClosestWalkableCell(client) {
        var pathFinding = new Pathfinding(client.character.getMap().dataMapProvider);
        var index = 0;
        var newCell = 0;
        var testedCell = [];
        var cells_near = pathFinding.getNeighbours(pathFinding.cells[client.character.cellid]);
        while (newCell == 0 && index < 900)
        {
            if (cells_near.length)
            {
                for (var i in cells_near) {
                    if (cells_near[i].cell._mov == true) {
                        newCell = cells_near[i].cell.id;
                        break;
                    }
                    else {
                        var cell = pathFinding.cells[cells_near[i].id];
                        cell.tested = false;
                        testedCell.push(cell);
                    }
                }

                if (newCell == 0)
                {
                    for (var i in testedCell) {
                        if (testedCell[i].tested == false) {
                            cells_near = null;
                            cells_near = pathFinding.getNeighbours(testedCell[i]);
                            testedCell[i].tested = true;
                            break;
                        }
                    }
                }
            }
            else
                break;
            index++;
        }
        return newCell;
    }

    findShortestPath(startCell, endCell, dynObstacles)
    {
        var finalPath = new Array();
        var startNode = this.getCell(startCell);
        var endNode = this.getCell(endCell);

        this.addToOpenList(this.getCell(startCell));
        
        var currentNode = null;
        while (this.openList.length > 0)
        {
            currentNode = this.getCurrentNode();
            if (currentNode.id == endNode.id){
                break;
            }
            this.addToCloseList(currentNode);
            var neighbours = this.getNeighbours(currentNode, dynObstacles);
            var maxi = neighbours.length;
            for (var i = 0; i < maxi; i++)
            {
                var node = neighbours[i];
                if (this.closedList.indexOf(node) != -1) {
                    continue;
                }
                var newG = parseInt(node.parent.g + this.CELL_DISTANCE_VALUE);
                var newH = parseInt(Math.abs(endNode.x - node.x) + Math.abs(endNode.y - node.y));
                var newF = parseInt(newH + newG);
                if (this.openList.indexOf(node) != -1)
                {
                    if (newG < node.g)
                    {
                        node.parent = currentNode;
                        node.g = newG;
                        node.h = newH;
                        node.f = newF;
                    }
                }
                else
                {
                    this.addToOpenList(node);
                    node.parent = currentNode;
                    node.g = newG;
                    node.h = newH;
                    node.f = newF;           
                }
            }
        }

        if (this.openList.length == 0)
            return finalPath;

        var lastNode = null;
        for(var i in this.openList) {
            var c = this.openList[i];
            if(c.id == endCell) {
                lastNode = c;
                break;
            }
        }
        while (lastNode.id != startNode.id)
        {
            finalPath.push(lastNode);
            lastNode = lastNode.parent;
        }

        finalPath.reverse();
        return finalPath;
    }
}