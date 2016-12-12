import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import CharacterManager from "../../managers/character_manager.js"
import CharacterItem from "../../database/models/character_item";
import Logger from "../../io/logger"


export default class StatsManager {

    get stats() {
        return this.character.stats;
    }

    constructor(character) {
        this.character = character;
    }

    getStatById(id) {
        return this.stats[id];
    }

    getBaseLife() {
        return 42 + ((this.character.level * 5) - 5); //TODO: Per class
    }

    getTotalStats(statsId) {
        var stat = this.getStatById(statsId);
        return stat.base + stat.additionnal + stat.objectsAndMountBonus + stat.alignGiftBonus + stat.contextModif;
    }

    getMaxLife() {
        return this.getBaseLife() + this.getTotalStats(11);
    }

    saveRaw() {
        if(!this.raw) return;
        this.raw = {stats: {}};
        this.raw.stats.strength = this.stats[10].base;
        this.raw.stats.vitality = this.stats[11].base;
        this.raw.stats.wisdom = this.stats[12].base;
        this.raw.stats.chance = this.stats[13].base;
        this.raw.stats.agility = this.stats[14].base;
        this.raw.stats.intelligence = this.stats[15].base;
    }

    getFightStatsManager() {
        var self = this;
        var fight = {
            getBuffBonus: function(id) {
                if(self.character.isInFight()) {
                    if(self.character.fighter.fightStatsBonus[id]) {
                        return self.character.fighter.fightStatsBonus[id];
                    }
                    else {
                        return 0;
                    }
                }
                else {
                    return 0;
                }
            }
        };

        return fight;
    }

    recalculateStats(raw) {
        if(raw) this.raw = raw;
        var fightBuff = this.getFightStatsManager();
        // Ajouter ici et dans fighter init fightStats
        this.stats[1] = new Types.CharacterBaseCharacteristic(6 + (this.character.level >= 100 ? 1 : 0), this.getItemTotalStat(111), 0, 0, fightBuff.getBuffBonus(1)); // PA
        this.stats[2] = new Types.CharacterBaseCharacteristic(3, this.getItemTotalStat(128), 0, 0, fightBuff.getBuffBonus(2)); // PM
        this.stats[10] = new Types.CharacterBaseCharacteristic(this.raw.stats ? this.raw.stats.strength : 0, this.getItemTotalStat(118), 0, 0, fightBuff.getBuffBonus(10));
        this.stats[11] = new Types.CharacterBaseCharacteristic(this.raw.stats ? this.raw.stats.vitality : 0, this.getItemTotalStat(125), 0, 0, fightBuff.getBuffBonus(11));
        this.stats[12] = new Types.CharacterBaseCharacteristic(this.raw.stats ? this.raw.stats.wisdom : 0, this.getItemTotalStat(124), 0, 0, fightBuff.getBuffBonus(12));
        this.stats[13] = new Types.CharacterBaseCharacteristic(this.raw.stats ? this.raw.stats.chance : 0, this.getItemTotalStat(123), 0, 0, fightBuff.getBuffBonus(13));
        this.stats[14] = new Types.CharacterBaseCharacteristic(this.raw.stats ? this.raw.stats.agility : 0, this.getItemTotalStat(119), 0, 0, fightBuff.getBuffBonus(14));
        this.stats[15] = new Types.CharacterBaseCharacteristic(this.raw.stats ? this.raw.stats.intelligence : 0, this.getItemTotalStat(126), 0, 0, fightBuff.getBuffBonus(15));
        this.stats[16] = new Types.CharacterBaseCharacteristic(0, this.getItemTotalStat(174), 0, 0, fightBuff.getBuffBonus(16)); // Initiative
        this.stats[17] = new Types.CharacterBaseCharacteristic(0, this.getItemTotalStat(138), 0, 0, fightBuff.getBuffBonus(17)); // Puissance
        this.stats[18] = new Types.CharacterBaseCharacteristic(0, this.getItemTotalStat(112), 0, 0, fightBuff.getBuffBonus(18)); // Fix damage
    }

    checkIfSet(sets, setId)
    {
        for (var i in sets)
        {
            if (sets[i]._id == setId)
                return true;
        }
        return false
    }

    getSetById(sets, setId)
    {
        for (var i in sets)
        {
            if (sets[i]._id == setId)
                return sets[i];
        }
        return null;
    }

    getSetEffectByActiveItem(effectId, set)
    {
        var bonus = 0;
        var effects = set.effects[(set.activeItem - 1)];
        if (effects.length > 0) {
            for (var effect of effects) {
                if (effect) {
                    if (effect.effectId == effectId) {
                        Logger.debug(effect.diceNum + " added for effect " + effectId);
                        bonus += effect.diceNum;
                    }
                }
            }
        }
        return bonus;
    }

    getSetsByEffect(effectId, total)
    {
        if (effectId <= 0)
            return total;
        var items = this.character.getItemsEquiped();
        var sets = [];
        for (var i in items)
        {
            if (items[i].set)
            {
                if (!this.checkIfSet(sets, items[i].set._id)) {
                    items[i].set.activeItem = 1;
                    sets.push(items[i].set)
                }
                else
                {
                    var set = this.getSetById(sets, items[i].set._id);
                    if (set)
                    {
                        set.activeItem = set.activeItem + 1;
                    }
                }
            }
        }
        for (var set of sets)
        {
            var bonus = this.getSetEffectByActiveItem(effectId, set);
            if (bonus > 0)
                total += bonus;
        }

        return total;
    }

    getItemTotalStat(effectId) {
        if(!this.character.itemBag) return 0;
        var total = 0;
        for(var item of this.character.itemBag.items) {
            if(item.position == CharacterItem.DEFAULT_SLOT) continue;
            for(var effect of item.effects) {
                if(effect.effectId == effectId) total += effect.value;
            }
        }
        return this.getSetsByEffect(effectId, total);
    }

    getActorExtendedAlignmentInformations() {
        return new Types.ActorExtendedAlignmentInformations(0, 0, 0, 0, 0, 0, 0, 0);
    }

    getCharacterCharacteristicsInformations() {
        return new Types.CharacterCharacteristicsInformations(
            this.character.experience, this.getExperienceFloor().xp,
            this.getNextExperienceFloor() ? this.getNextExperienceFloor().xp : this.getExperienceFloor().xp, 
            this.character.itemBag.money,
            this.character.statsPoints, 0, 
            this.character.spellPoints, 
            this.getActorExtendedAlignmentInformations(),
            this.character.life, this.getMaxLife(), 10000, 10000,
            this.character.isInFight() ? this.character.fighter.current.AP : this.getTotalStats(1),
            this.character.isInFight() ? this.character.fighter.current.MP : this.getTotalStats(2),
            this.getStatById(16),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            this.getStatById(1),
            this.getStatById(2),
            this.getStatById(10),
            this.getStatById(11),
            this.getStatById(12),
            this.getStatById(13),
            this.getStatById(14),
            this.getStatById(15),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            0,
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            this.getStatById(18),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            this.getStatById(17),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            [], 0
        );
    }

    sendStats() {
        this.recalculateStats();
        this.character.client.send(new Messages.CharacterStatsListMessage(this.getCharacterCharacteristicsInformations()));
        this.character.client.send(new Messages.UpdateLifePointsMessage(this.character.life, this.getMaxLife()));
        //this.character.client.send(new Messages.LifePointsRegenEndMessage(this.character.life, this.getMaxLife(), this.getMaxLife() - this.character.life));
    }

    sendFightStats() {
        this.recalculateStats();
        this.character.client.send(new Messages.FighterStatsListMessage(this.getCharacterCharacteristicsInformations()));
        //this.character.client.send(new Messages.LifePointsRegenEndMessage(this.character.life, this.getMaxLife(), this.getMaxLife() - this.character.life));
    }

    getExperienceFloor() {
        return CharacterManager.getExperienceFloorByLevel(this.character.level);
    }

    getNextExperienceFloor() {
        return CharacterManager.getExperienceFloorByLevel(this.character.level + 1);
    }

    checkLevelUp() {
        if(this.character.level != CharacterManager.getExperienceFloorByExperience(this.character.experience).level) { // Level up
            var floor = CharacterManager.getExperienceFloorByExperience(this.character.experience);
            var diffLevel = floor.level - this.character.level;
            this.character.level = floor.level;
            this.character.statsPoints += diffLevel * 5;
            this.character.spellPoints += diffLevel;
            this.character.life = this.getMaxLife();
            this.character.client.send(new Messages.CharacterLevelUpMessage(this.character.level));
            this.character.save();
            CharacterManager.learnSpellsForCharacter(this.character);
        }
    }

    getSpellsItemList() {
        var spells = [];
        for(var s of this.character.spells) {
            spells.push(new Types.SpellItem(s.spellId, s.spellLevel));
        }
        return spells;
    }

    sendSpellsList() {
        this.character.client.send(new Messages.SpellListMessage(true, this.getSpellsItemList()));
    }

    hasSpell(spellId) {
        for(var s of this.character.spells) {
            if(s.spellId == spellId) return true;
        }
        return false;
    }

    getSpell(spellId) {
        for(var s of this.character.spells) {
            if(s.spellId == spellId) return s;
        }
        return null;
    }
}