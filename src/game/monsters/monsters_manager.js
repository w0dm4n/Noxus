import MonstersGroup from "./monsters_group"
import Datacenter from "../../database/datacenter"

export default class MonstersManager {

    static getMonsterTemplate(templateId) {
        var monsters = Datacenter.monsters;
        for(var m of monsters) {
            if(m._id == templateId) {
                return m;
            }
        }
        return null;
    }
}