import MonstersManager from "./monsters_manager"
import Monster from "./monster"
import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"

export default class MonstersGroup {

    constructor(monsters, map, cellId) {
        this.id = map.getNextMonsterGroupsId();
        this.cellId = cellId;
        this.monsters = [];
        for(var m of monsters) {
            var template = MonstersManager.getMonsterTemplate(m.templateId);
            var grade =  template.grades[m.grade - 1];
            this.monsters.push(new Monster(template, grade));
        }
        this.map = map;
    }

    getGameRolePlayGroupMonsterInformations() {
        return new Types.GameRolePlayGroupMonsterInformations(this.id, this.monsters[0].getEntityLook(), new Types.EntityDispositionInformations(this.cellId, 3),
            this.getStaticInfos(), 0, 0, 0, 0, false, false, false);
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