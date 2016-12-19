import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"
import MonsterFighter from "../monster_fighter"

export default class FightPVMResult {

    constructor(applyTo, fight, fighter, isWinner, winners, others) {
        this.applyTo = applyTo;
        this.fight = fight;
        this.fighter = fighter;
        this.isWinner = isWinner;
        this.winners = winners;
        this.others = others;
    }

    getEntry() {
        var data = [];
        var f = this.fighter;
        var xp = 0;
        if(this.isWinner) {
            xp = this.calculateExperienceEarned();
            if(!this.fighter.isAI && this.applyTo.id == this.fighter.id) {
                this.fighter.character.experience += xp;
                this.fighter.character.statsManager.checkLevelUp();
                this.fighter.character.statsManager.sendStats();
            }
        }

        if(this.fighter.isAI) { // AI
            return new Types.FightResultFighterListEntry(this.isWinner ? 2 : 0, 0, new Types.FightLoot([], 0), f.id, f.alive);
        }
        else { // Player
            var experienceData = this.fighter.character.getExperienceFloorsData();
            data.push(new Types.FightResultExperienceData (this.fighter.character.experience, true, experienceData.floor.xp, true,
                experienceData.nextFloor.xp, true, xp, true, 0, false, 0, false, false, xp)
            );
            return new Types.FightResultPlayerListEntry(this.isWinner ? 2 : 0, 0, new Types.FightLoot([], 0),
                f.id, f.alive, f.level, data);
        }
    }

    calculateExperienceEarned() {
        //(1 + ((sagesse + (étoiles x 20) + bonus de challenges)/100)) x
        // (coefficient multiplicateur +multiplicateur de niveau de groupe) x (expérience de groupe / nombre de joueurs dans le groupe)
        var totalExp = 0;
        for(var m of this.others.fixedMembers) {
            if(m instanceof MonsterFighter) {
                totalExp += Math.floor((1 + (this.fighter.getStats().getTotalStats(12) / 100)) * (1.0, 0.5) * (m.monster.grade.gradeXp / this.winners.fixedMembers.length));
            }
        }
        return totalExp;
    }
}