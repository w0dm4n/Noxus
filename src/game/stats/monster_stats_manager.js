import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import Logger from "../../io/logger"

export default class MonsterStatsManager {

    constructor(fighter) {
        this.fighter = fighter;
        this.stats = [];
        this.recalculateStats();
    }

    getDodgeAndWithdrawal()
    {
        var totalWisdom = this.getTotalStats(12);
        return (totalWisdom > 0) ? (totalWisdom / 10) : 0;
    }


    recalculateStats() {
        var fightBuff = this.getFightStatsManager();
        this.stats[1] = new Types.CharacterBaseCharacteristic(this.fighter.monster.grade.actionPoints, 0, 0, 0, fightBuff.getBuffBonus(1)); // PA
        this.stats[2] = new Types.CharacterBaseCharacteristic(this.fighter.monster.grade.movementPoints, 0, 0, 0, fightBuff.getBuffBonus(2)); // PM
        this.stats[10] = new Types.CharacterBaseCharacteristic(this.fighter.monster.grade.vitality, 0, 0, 0, fightBuff.getBuffBonus(10));
        this.stats[11] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(11));
        this.stats[12] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(12));
        this.stats[13] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(13));
        this.stats[14] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(14));
        this.stats[15] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(15));
        this.stats[16] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(16)); // Initiative
        this.stats[17] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(17)); // Puissance
        this.stats[18] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(18)); // Fix damage
        this.stats[19] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(19)); // PO
        this.stats[20] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(20)); // Puissance sort
        this.stats[21] = new Types.CharacterBaseCharacteristic(0, 0, 0, 0, fightBuff.getBuffBonus(21)); // Critique percentage
    }

    getFightStatsManager() {
        var self = this;
        var fight = {
            getBuffBonus: function(id) {
                if(self.fighter.fightStatsBonus[id] != null) {
                    return self.fighter.fightStatsBonus[id];
                }
                else {
                    return 0;
                }
            }
        };

        return fight;
    }

    getTotalStats(statId) {
        this.recalculateStats();
        var stat = this.stats[statId];
        return stat.base + stat.additionnal + stat.objectsAndMountBonus + stat.alignGiftBonus + stat.contextModif;
    }

    getMaxLife() {
        var erosion = 0;
        return this.fighter.monster.grade.lifePoints + this.getTotalStats(11) - erosion;
    }
}