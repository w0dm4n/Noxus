import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import CharacterManager from "../../managers/character_manager.js"

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
        return 42; //TODO: Per class
    }

    getMaxLife() {
        return this.getBaseLife() + this.getStatById(11).base;
    }

    getActorExtendedAlignmentInformations() {
        return new Types.ActorExtendedAlignmentInformations(0, 0, 0, 0, 0, 0, 0, 0);
    }

    getCharacterCharacteristicsInformations() {
        return new Types.CharacterCharacteristicsInformations(
            this.character.experience, this.getExperienceFloor().xp,
            this.getNextExperienceFloor() ? this.getNextExperienceFloor().xp : this.getExperienceFloor().xp, 
            this.character.kamas, 
            this.character.statsPoints, 0, 
            this.character.spellPoints, 
            this.getActorExtendedAlignmentInformations(),
            this.character.life, this.getMaxLife(), 10000, 10000, 
            this.getStatById(1).base, 
            this.getStatById(2).base,
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
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
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            new Types.CharacterBaseCharacteristic(0, 0, 0, 0, 0),
            [], 0
        );
    }

    sendStats() {
        this.character.client.send(new Messages.CharacterStatsListMessage(this.getCharacterCharacteristicsInformations()));
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
            this.character.client.send(new Messages.CharacterLevelUpMessage(this.character.level));
        }
    }
}