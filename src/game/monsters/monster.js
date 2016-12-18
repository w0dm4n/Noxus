import LookManager from "../../managers/look_manager"
import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"

export default class Monster {

    constructor(template, grade) {
        this.template = template;
        this.grade = grade;
    }

    getEntityLook() {
       return LookManager.parseLook(this.template.look).toEntityLook();
    }

    getLightInformations() {
        return new Types.MonsterInGroupLightInformations(this.template._id, this.grade.grade);
    }

    getMonsterInGroupInformations() {
        if (this.grade) {
            return new Types.MonsterInGroupInformations(this.template._id, this.grade.grade, this.getEntityLook());
        }
    }
}