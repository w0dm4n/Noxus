import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class FightPVMResult {

    constructor(fight, fighter, isWinner) {
        this.fight = fight;
        this.fighter = fighter;
        this.isWinner = isWinner;
    }

    getEntry() {
        var data = [];
        var f = this.fighter;
        var exp = 0;
        if(this.isWinner) {
            exp = this.calculateExperienceEarned();
        }

        if(this.fighter.isAI) { // AI
            return new Types.FightResultFighterListEntry(this.isWinner ? 2 : 0, 0, new Types.FightLoot([], 0), f.id, f.alive);
        }
        else { // Player
            data.push(new Types.FightResultExperienceData(0, true, 0, true, 0, true, 0, true, 0, false, 0, false, false, 0));
            return new Types.FightResultPlayerListEntry(this.isWinner ? 2 : 0, 0, new Types.FightLoot([], 0),
                f.id, f.alive, f.level, data);
        }
    }

    calculateExperienceEarned() {

    }
}