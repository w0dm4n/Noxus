import Datacenter from "../../database/datacenter"
import Basic from "../../utils/basic"
import Logger from "../../io/logger"

export default class SpellManager {

    static getSpell(spellId) {
        for(var s of Datacenter.spells) {
            if(s._id == spellId) return s;
        }
        return null;
    }

    static getSpellLevel(spellLevelId) {
        for(var s of Datacenter.spellsLevels) {
            if(s._id == spellLevelId) return s;
        }
        return null;
    }
}