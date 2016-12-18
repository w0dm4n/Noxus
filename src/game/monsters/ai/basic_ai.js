import Logger from "../../../io/logger"
import Pathfinding from "../../../game/pathfinding/pathfinding"
import * as Types from "../../../io/dofus/types"
import * as Messages from "../../../io/dofus/messages"

export default class BasicAI {

    constructor(fighter) {
        this.fighter = fighter;
    }

    process() {
        try {
            var target = this.fighter.fight.getOppositeTeam(this.fighter.team).getAliveMembers()[0];
            var pathfinding = new Pathfinding(this.fighter.fight.map.dataMapProvider);
            pathfinding.fightMode = true;
            var path = pathfinding.findShortestPath(this.fighter.cellId, target.cellId, this.fighter.fight.getFightObstacles([this.fighter.cellId, target.cellId]));
            var self = this;
            this.move(path, function() {
                self.fighter.passTurn();
            });
        }
        catch (e) {
            Logger.error("Can't process the monster AI because : " + e.message);
            this.fighter.passTurn();
        }
    }

    move(path, callback) {
        var movementKeys = [this.fighter.cellId];
        for(var c of path) {
            if(this.fighter.fight.getFightObstacles().indexOf(c.cell.id) != -1) {
                break;
            }
            if(this.fighter.current.MP <= 0) {
                break;
            }
            movementKeys.push(c.cell.id);
            this.fighter.cellId = c.cell.id;
            this.fighter.current.MP--;
        }
        this.fighter.fight.send(new Messages.SequenceStartMessage(5, this.fighter.id));
        this.fighter.fight.send(new Messages.GameMapMovementMessage(movementKeys, this.fighter.id));
        this.fighter.fight.send(new Messages.GameActionFightPointsVariationMessage(129, this.fighter.id, this.fighter.id, -(movementKeys.length - 1)));
        this.fighter.fight.send(new Messages.SequenceEndMessage(3, this.fighter.id, 5));



        setTimeout(function(){
            callback();
        }, movementKeys.length * 200);
    }
}