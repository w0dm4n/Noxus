import MonstersManager from "./monsters_manager"
import Monster from "./monster"
import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import Basic from "../../utils/basic"
import Logger from "../../io/logger"
import MapPoint from "../pathfinding/map_point"

export default class MonstersGroup {

    constructor(monsters, map, cellId) {
        this.id = map.getNextMonsterGroupsId();
        this.cellId = cellId;
        this.monsters = [];
        this.creationTime = new Date().getTime();
        this.ageRate = 6000;
        for(var m of monsters) {
            var template = MonstersManager.getMonsterTemplate(m.templateId);
            var grade =  template.grades[m.grade - 1];
            this.monsters.push(new Monster(template, grade));
        }
        this.map = map;
        var self = this;
        this.timer = setInterval(function(){
            if(self.map.clients.length > 0) self.moveRandomly();
        }, Basic.getRandomInt(10, 30) * 1000);
    }

    getAgeBonus() {

    }

    moveRandomly() {
        try {
            var point = MapPoint.fromCellId(this.cellId);
            var neight = point.getNearestCells(true);
            var randomCell = neight[Basic.getRandomInt(1, neight.length - 1)];
            if(randomCell) {
                if(this.map.isWalkableCell(randomCell._nCellId)) {
                    this.map.send(new Messages.GameMapMovementMessage([this.cellId, randomCell._nCellId], this.id));
                    this.cellId = randomCell._nCellId;
                }
            }
        }
        catch (e) {
            //TODO ???
        }
    }

    removeFromMap() {
        Logger.debug("Remove monster groupe id: " + this.id + " on map id: " + this.map._id);
        clearInterval(this.timer);
        this.map.send(new Messages.GameContextRemoveElementMessage(this.id));
    }

    getGameRolePlayGroupMonsterInformations() {
        return new Types.GameRolePlayGroupMonsterInformations(this.id, this.monsters[0].getEntityLook(), new Types.EntityDispositionInformations(this.cellId, 3),
            this.getStaticInfos(), this.creationTime, this.ageRate, 0, 0, false, false, false);
    }

    getStaticInfos() {
        var monsters = [];
        for(var i in this.monsters) {
            if(i == 0) continue;
            monsters.push(this.monsters[i].getMonsterInGroupInformations());
        }
        return new Types.GroupMonsterStaticInformations(this.monsters[0].getLightInformations(), monsters);
    }
}