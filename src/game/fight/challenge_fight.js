import Logger from "../../io/logger"
import FightTeam from "./fight_team"
import Fighter from "./fighter"
import Fight from "./fight"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"

export default class ChallengeFight extends Fight {


    constructor(fighterOne, fighterTwo) {
        super(fighterOne);
        this.fightType = Fight.FIGHT_TYPE.FIGHT_TYPE_CHALLENGE;
        this.teams.blue = new FightTeam(this, 1, new Fighter(fighterTwo.character, this));
        this.teams.blue.placementCells = this.placementCells.blue;
    }

    sendStartupPhase(fighter) {
        fighter.send(new Messages.GameFightJoinMessage(true, true, true, false, 0, this.fightType));
        super.sendStartupPhase(fighter);
    }
}