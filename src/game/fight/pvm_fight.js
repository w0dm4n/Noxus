import Logger from "../../io/logger"
import FightTeam from "./fight_team"
import Fighter from "./fighter"
import MonsterFighter from "./monster_fighter"
import Fight from "./fight"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"

export default class PVMFight extends Fight {


    constructor(fighterOne, monstersGroup) {
        super(fighterOne);
        this.monstersGroup = monstersGroup;
        this.fightType = Fight.FIGHT_TYPE.FIGHT_TYPE_PvM;
        this.teams.blue = new FightTeam(this, 1, new MonsterFighter(this).initFromMonster(monstersGroup.monsters[0]));
        for(var i in monstersGroup.monsters) {
            if(i == 0) continue;
            this.teams.blue.addMember(new MonsterFighter(this).initFromMonster(monstersGroup.monsters[i]));
        }
        this.teams.blue.placementCells = this.placementCells.blue;
    }

    sendStartupPhase(fighter) {
        fighter.send(new Messages.GameFightJoinMessage(true, true, true, false, 0, this.fightType));
        super.sendStartupPhase(fighter);
    }
}