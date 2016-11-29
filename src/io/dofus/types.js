import IO from "../custom_data_wrapper"
import Logger from "../../io/logger"

export class Version {
    deserialize(buffer) {
        this.major = buffer.readByte();
        this.minor = buffer.readByte();
        this.release = buffer.readByte();
        this.revision = buffer.readInt();
        this.patch = buffer.readByte();
        this.buildType = buffer.readByte();
    }
}

export class VersionExtended extends Version {
    deserialize(buffer) {
        super.deserialize(buffer);
        this.install = buffer.readByte();
        this.technology = buffer.readByte();
    }
}

export class GameServerInformations {

    constructor(serverId, type, state, completion, isSelectable, charactersCount, date) {
        this.serverId = serverId;
        this.type = type;
        this.state = state;
        this.completion = completion;
        this.isSelectable = isSelectable;
        this.charactersCount = charactersCount;
        this.date = date;
    }

    serialize(buffer) {
        buffer.writeVarShort(this.serverId);
        buffer.writeByte(this.type);
        buffer.writeByte(this.state);
        buffer.writeByte(this.completion);
        buffer.writeBoolean(this.isSelectable);
        buffer.writeByte(this.charactersCount);
        buffer.writeByte(this.charactersCount > 0 ? 0 : 5);
        buffer.writeDouble(this.date);
    }
}

export class EntityLook {
    constructor(bonesId, skins, indexedColors, scales, subentities) {
        this.bonesId = bonesId;
        this.skins = skins;
        this.indexedColors = indexedColors;
        this.scales = scales;
        this.subentities = subentities;
    }

    serialize(buffer) {
        buffer.writeVarShort(this.bonesId);
        buffer.writeShort(this.skins.length);
        for (var i in this.skins) {
            buffer.writeVarShort(this.skins[i]);
        }
        buffer.writeShort(this.indexedColors.length);
        for (var i in this.indexedColors) {
            buffer.writeInt(this.indexedColors[i]);
        }
        buffer.writeShort(this.scales.length);
        for (var i in this.scales) {
            buffer.writeVarShort(this.scales[i]);
        }
        buffer.writeShort(this.subentities.length);
        for (var i in this.subentities) {
            this.subentities[i].serialize();
        }
    }
}

export class AbstractCharacterInformation {
    constructor(id) {
        this.id = id;
    }

    serialize(buffer) {
        buffer.writeVarLong(this.id);
    }
}

export class CharacterBasicMinimalInformations extends AbstractCharacterInformation {
    constructor(id, name) {
        super(id);
        this.name = name;
    }

    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeUTF(this.name);
    }
}

export class CharacterMinimalInformations extends CharacterBasicMinimalInformations {
    constructor(id, name, level) {
        super(id, name);
        this.level = level;
    }

    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeByte(this.level);
    }
}

export class CharacterMinimalPlusLookInformations extends CharacterMinimalInformations {
    constructor(id, name, level, entityLook) {
        super(id, name, level);
        this.entityLook = entityLook;
    }

    serialize(buffer) {
        super.serialize(buffer);
        this.entityLook.serialize(buffer);
    }
}

export class CharacterBaseInformations extends CharacterMinimalPlusLookInformations {

    static typeId = 45;

    constructor(id, name, level, entityLook, breed, sex) {
        super(id, name, level, entityLook);
        this.breed = breed;
        this.sex = sex;
    }

    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeByte(this.breed);
        buffer.writeBoolean(this.sex);
    }
}

export class GameContextActorInformations {
    constructor(contextualId, look, disposition) {
        this.protocolId = 150;
        this.contextualId = contextualId;
        this.look = look;
        this.disposition = disposition;
    }

    serialize(buffer) {
        buffer.writeDouble(this.contextualId);
        this.look.serialize(buffer);
        buffer.writeShort(this.disposition.protocolId);
        this.disposition.serialize(buffer);
    }
}

export class GameRolePlayActorInformations extends GameContextActorInformations {
    constructor(contextualId, look, disposition) {
        super(contextualId, look, disposition);
        this.protocolId = 141;
    }

    serialize(buffer) {
        super.serialize(buffer);
    }
}

export class GameRolePlayNamedActorInformations extends GameRolePlayActorInformations {
    constructor(name, contextualId, look, disposition) {
        super(contextualId, look, disposition);
        this.protocolId = 154;
        this.name = name;
    }

    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeUTF(this.name);
    }
}


export class GameRolePlayHumanoidInformations extends GameRolePlayNamedActorInformations {
    constructor(humanoidInfo, accountId, name, contextualId, look, disposition) {
        super(name, contextualId, look, disposition);
        this.protocolId = 159;
        this.humanoidInfo = humanoidInfo;
        this.accountId = accountId;
    }

    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeShort(this.humanoidInfo.protocolId);
        this.humanoidInfo.serialize(buffer);
        buffer.writeInt(this.accountId);
    }
}

export class GameRolePlayCharacterInformations extends GameRolePlayHumanoidInformations {
    constructor(alignmentInfos, humanoidInfo, accountId, name, contextualId, look, disposition) {
        super(humanoidInfo, accountId, name, contextualId, look, disposition);
        this.protocolId = 36;
        this.alignmentInfos = alignmentInfos;
    }

    serialize(buffer) {
        super.serialize(buffer);
        this.alignmentInfos.serialize(buffer);
    }
}

export class ActorAlignmentInformations {
    constructor(alignmentSide, alignmentValue, alignmentGrade, characterPower) {
        this.alignmentSide = alignmentSide;
        this.alignmentValue = alignmentValue;
        this.alignmentGrade = alignmentGrade;
        this.characterPower = characterPower;
    }

    serialize(buffer) {
        buffer.writeByte(this.alignmentSide);
        buffer.writeByte(this.alignmentValue);
        buffer.writeByte(this.alignmentGrade);
        buffer.writeDouble(this.characterPower);
    }
}

export class ActorExtendedAlignmentInformations extends ActorAlignmentInformations {
    constructor(alignmentSide, alignmentValue, alignmentGrade, characterPower, honor, honorGradeFloor, honorNextGradeFloor, aggressable) {
        super(alignmentSide, alignmentValue, alignmentGrade, characterPower);
        this.honor = honor;
        this.honorGradeFloor = honorGradeFloor;
        this.honorNextGradeFloor = aggressable;
    }

    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeVarShort(this.honor);
        buffer.writeVarShort(this.honorGradeFloor);
        buffer.writeVarShort(this.honorNextGradeFloor);
        buffer.writeByte(this.aggressable);
    }
}

export class HumanInformations {
    constructor(restrictions, sex, options) {
        this.protocolId = 157;
        this.restrictions = restrictions;
        this.sex = sex;
        this.options = options;
    }

    serialize(buffer) {
        this.restrictions.serialize(buffer);
        buffer.writeBoolean(this.sex);
        buffer.writeShort(this.options.length);
        for (var i in this.options) {
            this.options[i].serialize(buffer);
        }
    }
}

export class ActorRestrictionsInformations {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12, param13, param14, param15, param16, param17, param18, param19, param20, param21) {
        this.cantBeAggressed = param1;
        this.cantBeChallenged = param2;
        this.cantTrade = param3;
        this.cantBeAttackedByMutant = param4;
        this.cantRun = param5;
        this.forceSlowWalk = param6;
        this.cantMinimize = param7;
        this.cantMove = param8;
        this.cantAggress = param9;
        this.cantChallenge = param10;
        this.cantExchange = param11;
        this.cantAttack = param12;
        this.cantChat = param13;
        this.cantBeMerchant = param14;
        this.cantUseObject = param15;
        this.cantUseTaxCollector = param16;
        this.cantUseInteractive = param17;
        this.cantSpeakToNPC = param18;
        this.cantChangeZone = param19;
        this.cantAttackMonster = param20;
        this.cantWalk8Directions = param21;
    }

    serialize(buffer) {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.cantBeAggressed);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.cantBeChallenged);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 2, this.cantTrade);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 3, this.cantBeAttackedByMutant);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 4, this.cantRun);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 5, this.forceSlowWalk);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 6, this.cantMinimize);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 7, this.cantMove);
        buffer.writeByte(_loc2_);
        var _loc3_ = 0;
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 0, this.cantAggress);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 1, this.cantChallenge);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 2, this.cantExchange);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 3, this.cantAttack);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 4, this.cantChat);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 5, this.cantBeMerchant);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 6, this.cantUseObject);
        _loc3_ = IO.BooleanByteWrapper.setFlag(_loc3_, 7, this.cantUseTaxCollector);
        buffer.writeByte(_loc3_);
        var _loc4_ = 0;
        _loc4_ = IO.BooleanByteWrapper.setFlag(_loc4_, 0, this.cantUseInteractive);
        _loc4_ = IO.BooleanByteWrapper.setFlag(_loc4_, 1, this.cantSpeakToNPC);
        _loc4_ = IO.BooleanByteWrapper.setFlag(_loc4_, 2, this.cantChangeZone);
        _loc4_ = IO.BooleanByteWrapper.setFlag(_loc4_, 3, this.cantAttackMonster);
        _loc4_ = IO.BooleanByteWrapper.setFlag(_loc4_, 4, this.cantWalk8Directions);
        buffer.writeByte(_loc4_);
    }
}

export class EntityDispositionInformations {
    constructor(cellId, direction) {
        this.protocolId = 60;
        this.cellId = cellId;
        this.direction = direction;
    }

    serialize(buffer) {
        buffer.writeShort(this.cellId);
        buffer.writeByte(this.direction);
    }
}

export class ActorOrientation {
    constructor(id, direction) {
        this.protocolId = 353;
        this.id = id;
        this.direction = direction;
    }

    serialize(buffer) {
        buffer.writeDouble(this.id);
        buffer.writeByte(this.direction);
    }
}


export class CharacterCharacteristicsInformations {
    constructor(experience, experienceLevelFloor, experienceNextLevelFloor, kamas, statsPoints, additionnalPoints, spellsPoints, alignmentInfos, lifePoints, maxLifePoints, energyPoints, maxEnergyPoints, actionPointsCurrent, movementPointsCurrent, initiative, prospecting, actionPoints, movementPoints, strength, vitality, wisdom, chance, agility, intelligence, range, summonableCreaturesBoost, reflect, criticalHit, criticalHitWeapon, criticalMiss, healBonus, allDamagesBonus, weaponDamagesBonusPercent, damagesBonusPercent, trapBonus, trapBonusPercent, glyphBonusPercent, runeBonusPercent, permanentDamagePercent, tackleBlock, tackleEvade, PAAttack, PMAttack, pushDamageBonus, criticalDamageBonus, neutralDamageBonus, earthDamageBonus, waterDamageBonus, airDamageBonus, fireDamageBonus, dodgePALostProbability, dodgePMLostProbability, neutralElementResistPercent, earthElementResistPercent, waterElementResistPercent, airElementResistPercent, fireElementResistPercent, neutralElementReduction, earthElementReduction, waterElementReduction, airElementReduction, fireElementReduction, pushDamageReduction, criticalDamageReduction, pvpNeutralElementResistPercent, pvpEarthElementResistPercent, pvpWaterElementResistPercent, pvpAirElementResistPercent, pvpFireElementResistPercent, pvpNeutralElementReduction, pvpEarthElementReduction, pvpWaterElementReduction, pvpAirElementReduction, pvpFireElementReduction, spellModifications, probationTime) {
        this.protocolId = 8;
        this.experience = experience;
        this.experienceLevelFloor = experienceLevelFloor;
        this.experienceNextLevelFloor = experienceNextLevelFloor;
        this.kamas = kamas;
        this.statsPoints = statsPoints;
        this.additionnalPoints = additionnalPoints;
        this.spellsPoints = spellsPoints;
        this.alignmentInfos = alignmentInfos;
        this.lifePoints = lifePoints;
        this.maxLifePoints = maxLifePoints;
        this.energyPoints = energyPoints;
        this.maxEnergyPoints = maxEnergyPoints;
        this.actionPointsCurrent = actionPointsCurrent;
        this.movementPointsCurrent = movementPointsCurrent;
        this.initiative = initiative;
        this.prospecting = prospecting;
        this.actionPoints = actionPoints;
        this.movementPoints = movementPoints;
        this.strength = strength;
        this.vitality = vitality;
        this.wisdom = wisdom;
        this.chance = chance;
        this.agility = agility;
        this.intelligence = intelligence;
        this.range = range;
        this.summonableCreaturesBoost = summonableCreaturesBoost;
        this.reflect = reflect;
        this.criticalHit = criticalHit;
        this.criticalHitWeapon = criticalHitWeapon;
        this.criticalMiss = criticalMiss;
        this.healBonus = healBonus;
        this.allDamagesBonus = allDamagesBonus;
        this.weaponDamagesBonusPercent = weaponDamagesBonusPercent;
        this.damagesBonusPercent = damagesBonusPercent;
        this.trapBonus = trapBonus;
        this.trapBonusPercent = trapBonusPercent;
        this.glyphBonusPercent = glyphBonusPercent;
        this.runeBonusPercent = runeBonusPercent;
        this.permanentDamagePercent = permanentDamagePercent;
        this.tackleBlock = tackleBlock;
        this.tackleEvade = tackleEvade;
        this.PAAttack = PAAttack;
        this.PMAttack = PMAttack;
        this.pushDamageBonus = pushDamageBonus;
        this.criticalDamageBonus = criticalDamageBonus;
        this.neutralDamageBonus = neutralDamageBonus;
        this.earthDamageBonus = earthDamageBonus;
        this.waterDamageBonus = waterDamageBonus;
        this.airDamageBonus = airDamageBonus;
        this.fireDamageBonus = fireDamageBonus;
        this.dodgePALostProbability = dodgePALostProbability;
        this.dodgePMLostProbability = dodgePMLostProbability;
        this.neutralElementResistPercent = neutralElementResistPercent;
        this.earthElementResistPercent = earthElementResistPercent;
        this.waterElementResistPercent = waterElementResistPercent;
        this.airElementResistPercent = airElementResistPercent;
        this.fireElementResistPercent = fireElementResistPercent;
        this.neutralElementReduction = neutralElementReduction;
        this.earthElementReduction = earthElementReduction;
        this.waterElementReduction = waterElementReduction;
        this.airElementReduction = airElementReduction;
        this.fireElementReduction = fireElementReduction;
        this.pushDamageReduction = pushDamageReduction;
        this.criticalDamageReduction = criticalDamageReduction;
        this.pvpNeutralElementResistPercent = pvpNeutralElementResistPercent;
        this.pvpEarthElementResistPercent = pvpEarthElementResistPercent;
        this.pvpWaterElementResistPercent = pvpWaterElementResistPercent;
        this.pvpAirElementResistPercent = pvpAirElementResistPercent;
        this.pvpFireElementResistPercent = pvpFireElementResistPercent;
        this.pvpNeutralElementReduction = pvpNeutralElementReduction;
        this.pvpEarthElementReduction = pvpEarthElementReduction;
        this.pvpWaterElementReduction = pvpWaterElementReduction;
        this.pvpAirElementReduction = pvpAirElementReduction;
        this.pvpFireElementReduction = pvpFireElementReduction;
        this.spellModifications = spellModifications;
        this.probationTime = probationTime;
    }
    serialize(buffer) {
        if (this.experience < 0 || this.experience > 9007199254740990) {
            Logger.error("Forbidden value (" + this.experience + ") on element experience.");
        }
        buffer.writeVarLong(this.experience);
        if (this.experienceLevelFloor < 0 || this.experienceLevelFloor > 9007199254740990) {
            Logger.error("Forbidden value (" + this.experienceLevelFloor + ") on element experienceLevelFloor.");
        }
        buffer.writeVarLong(this.experienceLevelFloor);
        if (this.experienceNextLevelFloor < 0 || this.experienceNextLevelFloor > 9007199254740990) {
            Logger.error("Forbidden value (" + this.experienceNextLevelFloor + ") on element experienceNextLevelFloor.");
        }
        buffer.writeVarLong(this.experienceNextLevelFloor);
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element kamas.");
        }
        buffer.writeInt(this.kamas);
        if (this.statsPoints < 0) {
            Logger.error("Forbidden value (" + this.statsPoints + ") on element statsPoints.");
        }
        buffer.writeVarShort(this.statsPoints);
        if (this.additionnalPoints < 0) {
            Logger.error("Forbidden value (" + this.additionnalPoints + ") on element additionnalPoints.");
        }
        buffer.writeVarShort(this.additionnalPoints);
        if (this.spellsPoints < 0) {
            Logger.error("Forbidden value (" + this.spellsPoints + ") on element spellsPoints.");
        }
        buffer.writeVarShort(this.spellsPoints);
        this.alignmentInfos.serialize(buffer);
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element lifePoints.");
        }
        buffer.writeVarInt(this.lifePoints);
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element maxLifePoints.");
        }
        buffer.writeVarInt(this.maxLifePoints);
        if (this.energyPoints < 0) {
            Logger.error("Forbidden value (" + this.energyPoints + ") on element energyPoints.");
        }
        buffer.writeVarShort(this.energyPoints);
        if (this.maxEnergyPoints < 0) {
            Logger.error("Forbidden value (" + this.maxEnergyPoints + ") on element maxEnergyPoints.");
        }
        buffer.writeVarShort(this.maxEnergyPoints);
        buffer.writeVarShort(this.actionPointsCurrent);
        buffer.writeVarShort(this.movementPointsCurrent);
        this.initiative.serialize(buffer);
        this.prospecting.serialize(buffer);
        this.actionPoints.serialize(buffer);
        this.movementPoints.serialize(buffer);
        this.strength.serialize(buffer);
        this.vitality.serialize(buffer);
        this.wisdom.serialize(buffer);
        this.chance.serialize(buffer);
        this.agility.serialize(buffer);
        this.intelligence.serialize(buffer);
        this.range.serialize(buffer);
        this.summonableCreaturesBoost.serialize(buffer);
        this.reflect.serialize(buffer);
        this.criticalHit.serialize(buffer);
        if (this.criticalHitWeapon < 0) {
            Logger.error("Forbidden value (" + this.criticalHitWeapon + ") on element criticalHitWeapon.");
        }
        buffer.writeVarShort(this.criticalHitWeapon);
        this.criticalMiss.serialize(buffer);
        this.healBonus.serialize(buffer);
        this.allDamagesBonus.serialize(buffer);
        this.weaponDamagesBonusPercent.serialize(buffer);
        this.damagesBonusPercent.serialize(buffer);
        this.trapBonus.serialize(buffer);
        this.trapBonusPercent.serialize(buffer);
        this.glyphBonusPercent.serialize(buffer);
        this.runeBonusPercent.serialize(buffer);
        this.permanentDamagePercent.serialize(buffer);
        this.tackleBlock.serialize(buffer);
        this.tackleEvade.serialize(buffer);
        this.PAAttack.serialize(buffer);
        this.PMAttack.serialize(buffer);
        this.pushDamageBonus.serialize(buffer);
        this.criticalDamageBonus.serialize(buffer);
        this.neutralDamageBonus.serialize(buffer);
        this.earthDamageBonus.serialize(buffer);
        this.waterDamageBonus.serialize(buffer);
        this.airDamageBonus.serialize(buffer);
        this.fireDamageBonus.serialize(buffer);
        this.dodgePALostProbability.serialize(buffer);
        this.dodgePMLostProbability.serialize(buffer);
        this.neutralElementResistPercent.serialize(buffer);
        this.earthElementResistPercent.serialize(buffer);
        this.waterElementResistPercent.serialize(buffer);
        this.airElementResistPercent.serialize(buffer);
        this.fireElementResistPercent.serialize(buffer);
        this.neutralElementReduction.serialize(buffer);
        this.earthElementReduction.serialize(buffer);
        this.waterElementReduction.serialize(buffer);
        this.airElementReduction.serialize(buffer);
        this.fireElementReduction.serialize(buffer);
        this.pushDamageReduction.serialize(buffer);
        this.criticalDamageReduction.serialize(buffer);
        this.pvpNeutralElementResistPercent.serialize(buffer);
        this.pvpEarthElementResistPercent.serialize(buffer);
        this.pvpWaterElementResistPercent.serialize(buffer);
        this.pvpAirElementResistPercent.serialize(buffer);
        this.pvpFireElementResistPercent.serialize(buffer);
        this.pvpNeutralElementReduction.serialize(buffer);
        this.pvpEarthElementReduction.serialize(buffer);
        this.pvpWaterElementReduction.serialize(buffer);
        this.pvpAirElementReduction.serialize(buffer);
        this.pvpFireElementReduction.serialize(buffer);
        buffer.writeShort(this.spellModifications.length);
        var _loc2_ = 0;
        while (_loc2_ < this.spellModifications.length) {
            this.spellModifications[_loc2_].serialize(buffer);
            _loc2_++;
        }
        if (this.probationTime < 0) {
            Logger.error("Forbidden value (" + this.probationTime + ") on element probationTime.");
        }
        buffer.writeInt(this.probationTime);
    }
    deserialize(buffer) {
        var _loc4_ = null;
        this.experience = buffer.readVarUhLong();
        if (this.experience < 0 || this.experience > 9007199254740990) {
            Logger.error("Forbidden value (" + this.experience + ") on element of CharacterCharacteristicsInformations.experience.");
        }
        this.experienceLevelFloor = buffer.readVarUhLong();
        if (this.experienceLevelFloor < 0 || this.experienceLevelFloor > 9007199254740990) {
            Logger.error("Forbidden value (" + this.experienceLevelFloor + ") on element of CharacterCharacteristicsInformations.experienceLevelFloor.");
        }
        this.experienceNextLevelFloor = buffer.readVarUhLong();
        if (this.experienceNextLevelFloor < 0 || this.experienceNextLevelFloor > 9007199254740990) {
            Logger.error("Forbidden value (" + this.experienceNextLevelFloor + ") on element of CharacterCharacteristicsInformations.experienceNextLevelFloor.");
        }
        this.kamas = buffer.readInt();
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element of CharacterCharacteristicsInformations.kamas.");
        }
        this.statsPoints = buffer.readVarUhShort();
        if (this.statsPoints < 0) {
            Logger.error("Forbidden value (" + this.statsPoints + ") on element of CharacterCharacteristicsInformations.statsPoints.");
        }
        this.additionnalPoints = buffer.readVarUhShort();
        if (this.additionnalPoints < 0) {
            Logger.error("Forbidden value (" + this.additionnalPoints + ") on element of CharacterCharacteristicsInformations.additionnalPoints.");
        }
        this.spellsPoints = buffer.readVarUhShort();
        if (this.spellsPoints < 0) {
            Logger.error("Forbidden value (" + this.spellsPoints + ") on element of CharacterCharacteristicsInformations.spellsPoints.");
        }
        this.alignmentInfos = new ActorExtendedAlignmentInformations();
        this.alignmentInfos.deserialize(buffer);
        this.lifePoints = buffer.readVarUhInt();
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element of CharacterCharacteristicsInformations.lifePoints.");
        }
        this.maxLifePoints = buffer.readVarUhInt();
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element of CharacterCharacteristicsInformations.maxLifePoints.");
        }
        this.energyPoints = buffer.readVarUhShort();
        if (this.energyPoints < 0) {
            Logger.error("Forbidden value (" + this.energyPoints + ") on element of CharacterCharacteristicsInformations.energyPoints.");
        }
        this.maxEnergyPoints = buffer.readVarUhShort();
        if (this.maxEnergyPoints < 0) {
            Logger.error("Forbidden value (" + this.maxEnergyPoints + ") on element of CharacterCharacteristicsInformations.maxEnergyPoints.");
        }
        this.actionPointsCurrent = buffer.readVarShort();
        this.movementPointsCurrent = buffer.readVarShort();
        this.initiative = new CharacterBaseCharacteristic();
        this.initiative.deserialize(buffer);
        this.prospecting = new CharacterBaseCharacteristic();
        this.prospecting.deserialize(buffer);
        this.actionPoints = new CharacterBaseCharacteristic();
        this.actionPoints.deserialize(buffer);
        this.movementPoints = new CharacterBaseCharacteristic();
        this.movementPoints.deserialize(buffer);
        this.strength = new CharacterBaseCharacteristic();
        this.strength.deserialize(buffer);
        this.vitality = new CharacterBaseCharacteristic();
        this.vitality.deserialize(buffer);
        this.wisdom = new CharacterBaseCharacteristic();
        this.wisdom.deserialize(buffer);
        this.chance = new CharacterBaseCharacteristic();
        this.chance.deserialize(buffer);
        this.agility = new CharacterBaseCharacteristic();
        this.agility.deserialize(buffer);
        this.intelligence = new CharacterBaseCharacteristic();
        this.intelligence.deserialize(buffer);
        this.range = new CharacterBaseCharacteristic();
        this.range.deserialize(buffer);
        this.summonableCreaturesBoost = new CharacterBaseCharacteristic();
        this.summonableCreaturesBoost.deserialize(buffer);
        this.reflect = new CharacterBaseCharacteristic();
        this.reflect.deserialize(buffer);
        this.criticalHit = new CharacterBaseCharacteristic();
        this.criticalHit.deserialize(buffer);
        this.criticalHitWeapon = buffer.readVarUhShort();
        if (this.criticalHitWeapon < 0) {
            Logger.error("Forbidden value (" + this.criticalHitWeapon + ") on element of CharacterCharacteristicsInformations.criticalHitWeapon.");
        }
        this.criticalMiss = new CharacterBaseCharacteristic();
        this.criticalMiss.deserialize(buffer);
        this.healBonus = new CharacterBaseCharacteristic();
        this.healBonus.deserialize(buffer);
        this.allDamagesBonus = new CharacterBaseCharacteristic();
        this.allDamagesBonus.deserialize(buffer);
        this.weaponDamagesBonusPercent = new CharacterBaseCharacteristic();
        this.weaponDamagesBonusPercent.deserialize(buffer);
        this.damagesBonusPercent = new CharacterBaseCharacteristic();
        this.damagesBonusPercent.deserialize(buffer);
        this.trapBonus = new CharacterBaseCharacteristic();
        this.trapBonus.deserialize(buffer);
        this.trapBonusPercent = new CharacterBaseCharacteristic();
        this.trapBonusPercent.deserialize(buffer);
        this.glyphBonusPercent = new CharacterBaseCharacteristic();
        this.glyphBonusPercent.deserialize(buffer);
        this.runeBonusPercent = new CharacterBaseCharacteristic();
        this.runeBonusPercent.deserialize(buffer);
        this.permanentDamagePercent = new CharacterBaseCharacteristic();
        this.permanentDamagePercent.deserialize(buffer);
        this.tackleBlock = new CharacterBaseCharacteristic();
        this.tackleBlock.deserialize(buffer);
        this.tackleEvade = new CharacterBaseCharacteristic();
        this.tackleEvade.deserialize(buffer);
        this.PAAttack = new CharacterBaseCharacteristic();
        this.PAAttack.deserialize(buffer);
        this.PMAttack = new CharacterBaseCharacteristic();
        this.PMAttack.deserialize(buffer);
        this.pushDamageBonus = new CharacterBaseCharacteristic();
        this.pushDamageBonus.deserialize(buffer);
        this.criticalDamageBonus = new CharacterBaseCharacteristic();
        this.criticalDamageBonus.deserialize(buffer);
        this.neutralDamageBonus = new CharacterBaseCharacteristic();
        this.neutralDamageBonus.deserialize(buffer);
        this.earthDamageBonus = new CharacterBaseCharacteristic();
        this.earthDamageBonus.deserialize(buffer);
        this.waterDamageBonus = new CharacterBaseCharacteristic();
        this.waterDamageBonus.deserialize(buffer);
        this.airDamageBonus = new CharacterBaseCharacteristic();
        this.airDamageBonus.deserialize(buffer);
        this.fireDamageBonus = new CharacterBaseCharacteristic();
        this.fireDamageBonus.deserialize(buffer);
        this.dodgePALostProbability = new CharacterBaseCharacteristic();
        this.dodgePALostProbability.deserialize(buffer);
        this.dodgePMLostProbability = new CharacterBaseCharacteristic();
        this.dodgePMLostProbability.deserialize(buffer);
        this.neutralElementResistPercent = new CharacterBaseCharacteristic();
        this.neutralElementResistPercent.deserialize(buffer);
        this.earthElementResistPercent = new CharacterBaseCharacteristic();
        this.earthElementResistPercent.deserialize(buffer);
        this.waterElementResistPercent = new CharacterBaseCharacteristic();
        this.waterElementResistPercent.deserialize(buffer);
        this.airElementResistPercent = new CharacterBaseCharacteristic();
        this.airElementResistPercent.deserialize(buffer);
        this.fireElementResistPercent = new CharacterBaseCharacteristic();
        this.fireElementResistPercent.deserialize(buffer);
        this.neutralElementReduction = new CharacterBaseCharacteristic();
        this.neutralElementReduction.deserialize(buffer);
        this.earthElementReduction = new CharacterBaseCharacteristic();
        this.earthElementReduction.deserialize(buffer);
        this.waterElementReduction = new CharacterBaseCharacteristic();
        this.waterElementReduction.deserialize(buffer);
        this.airElementReduction = new CharacterBaseCharacteristic();
        this.airElementReduction.deserialize(buffer);
        this.fireElementReduction = new CharacterBaseCharacteristic();
        this.fireElementReduction.deserialize(buffer);
        this.pushDamageReduction = new CharacterBaseCharacteristic();
        this.pushDamageReduction.deserialize(buffer);
        this.criticalDamageReduction = new CharacterBaseCharacteristic();
        this.criticalDamageReduction.deserialize(buffer);
        this.pvpNeutralElementResistPercent = new CharacterBaseCharacteristic();
        this.pvpNeutralElementResistPercent.deserialize(buffer);
        this.pvpEarthElementResistPercent = new CharacterBaseCharacteristic();
        this.pvpEarthElementResistPercent.deserialize(buffer);
        this.pvpWaterElementResistPercent = new CharacterBaseCharacteristic();
        this.pvpWaterElementResistPercent.deserialize(buffer);
        this.pvpAirElementResistPercent = new CharacterBaseCharacteristic();
        this.pvpAirElementResistPercent.deserialize(buffer);
        this.pvpFireElementResistPercent = new CharacterBaseCharacteristic();
        this.pvpFireElementResistPercent.deserialize(buffer);
        this.pvpNeutralElementReduction = new CharacterBaseCharacteristic();
        this.pvpNeutralElementReduction.deserialize(buffer);
        this.pvpEarthElementReduction = new CharacterBaseCharacteristic();
        this.pvpEarthElementReduction.deserialize(buffer);
        this.pvpWaterElementReduction = new CharacterBaseCharacteristic();
        this.pvpWaterElementReduction.deserialize(buffer);
        this.pvpAirElementReduction = new CharacterBaseCharacteristic();
        this.pvpAirElementReduction.deserialize(buffer);
        this.pvpFireElementReduction = new CharacterBaseCharacteristic();
        this.pvpFireElementReduction.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new CharacterSpellModification();
            _loc4_.deserialize(buffer);
            this.spellModifications.push(_loc4_);
            _loc3_++;
        }
        this.probationTime = buffer.readInt();
        if (this.probationTime < 0) {
            Logger.error("Forbidden value (" + this.probationTime + ") on element of CharacterCharacteristicsInformations.probationTime.");
        }
    }
}

export class CharacterBaseCharacteristic {
    constructor(base, additionnal, objectsAndMountBonus, alignGiftBonus, contextModif) {
        this.protocolId = 4;
        this.base = base;
        this.additionnal = additionnal;
        this.objectsAndMountBonus = objectsAndMountBonus;
        this.alignGiftBonus = alignGiftBonus;
        this.contextModif = contextModif;
    }
    serialize(buffer) {
        buffer.writeVarShort(this.base);
        buffer.writeVarShort(this.additionnal);
        buffer.writeVarShort(this.objectsAndMountBonus);
        buffer.writeVarShort(this.alignGiftBonus);
        buffer.writeVarShort(this.contextModif);
    }
    deserialize(buffer) {
        this.base = buffer.readVarShort();
        this.additionnal = buffer.readVarShort();
        this.objectsAndMountBonus = buffer.readVarShort();
        this.alignGiftBonus = buffer.readVarShort();
        this.contextModif = buffer.readVarShort();
    }
}

export class AbstractContactInformations {
    constructor(accountId, accountName) {
        this.protocolId = 380;
        this.accountId = accountId;
        this.accountName = accountName;
    }
    serialize(buffer) {
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        buffer.writeInt(this.accountId);
        buffer.writeUTF(this.accountName);
    }
    deserialize(buffer) {
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of AbstractContactInformations.accountId.");
        }
        this.accountName = buffer.readUTF();
    }
}

export class FriendInformations extends AbstractContactInformations {
    constructor(param1, param2, playerState, lastConnection, achievementPoints) {

        super(param1, param2);
        this.protocolId = 78;
        this.playerState = playerState;
        this.lastConnection = lastConnection;
        this.achievementPoints = achievementPoints;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeByte(this.playerState);
        if (this.lastConnection < 0) {
            Logger.error("Forbidden value (" + this.lastConnection + ") on element lastConnection.");
        }
        buffer.writeVarShort(this.lastConnection);
        buffer.writeInt(this.achievementPoints);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.playerState = buffer.readByte();
        if (this.playerState < 0) {
            Logger.error("Forbidden value (" + this.playerState + ") on element of FriendInformations.playerState.");
        }
        this.lastConnection = buffer.readVarUhShort();
        if (this.lastConnection < 0) {
            Logger.error("Forbidden value (" + this.lastConnection + ") on element of FriendInformations.lastConnection.");
        }
        this.achievementPoints = buffer.readInt();
    }
}

export class FriendOnlineInformations extends FriendInformations {
    constructor(param1, param2, param3, param4, param5, playerId, playerName, level, alignmentSide, breed, sex, guildInfo, moodSmileyId, status) {
        super(param1, param2, param3, param4, param5);
        this.protocolId = 92;
        this.playerId = playerId;
        this.playerName = playerName;
        this.level = level;
        this.alignmentSide = alignmentSide;
        this.breed = breed;
        this.sex = sex;
        this.guildInfo = guildInfo;
        this.moodSmileyId = moodSmileyId;
        this.status = status;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element playerId.");
        }
        buffer.writeVarLong(this.playerId);
        buffer.writeUTF(this.playerName);
        buffer.writeByte(this.level);
        buffer.writeByte(this.alignmentSide);
        buffer.writeByte(this.breed);
        buffer.writeBoolean(this.sex);
        this.guildInfo.serialize(buffer);
        if (this.moodSmileyId < 0) {
            Logger.error("Forbidden value (" + this.moodSmileyId + ") on element moodSmileyId.");
        }
        buffer.writeVarShort(this.moodSmileyId);
        buffer.writeShort(this.status.protocolId);
        this.status.serialize(buffer);
    }
}

export class PlayerStatus {
    constructor(statusId) {
        this.protocolId = 415;
        this.statusId = statusId;
    }
    serialize(buffer) {
        buffer.writeByte(this.statusId);
    }
    deserialize(buffer) {
        this.statusId = buffer.readByte();
        if (this.statusId < 0) {
            Logger.error("Forbidden value (" + this.statusId + ") on element of PlayerStatus.statusId.");
        }
    }
}

export class AbstractSocialGroupInfos {
    constructor() {
        this.protocolId = 416;
    }
    serialize(buffer) {
    }
    deserialize(buffer) {
    }
}

export class BasicGuildInformations extends AbstractSocialGroupInfos {
    constructor(guildId, guildName, guildLevel) {
        super();
        this.protocolId = 365;
        this.guildId = guildId;
        this.guildName = guildName;
        this.guildLevel = guildLevel;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.guildId < 0) {
            Logger.error("Forbidden value (" + this.guildId + ") on element guildId.");
        }
        buffer.writeVarInt(this.guildId);
        buffer.writeUTF(this.guildName);
        buffer.writeByte(this.guildLevel);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guildId = buffer.readVarUhInt();
        if (this.guildId < 0) {
            Logger.error("Forbidden value (" + this.guildId + ") on element of BasicGuildInformations.guildId.");
        }
        this.guildName = buffer.readUTF();
        this.guildLevel = buffer.readByte();
        if (this.guildLevel < 0 || this.guildLevel > 200) {
            Logger.error("Forbidden value (" + this.guildLevel + ") on element of BasicGuildInformations.guildLevel.");
        }
    }
}

export class GuildEmblem {
    constructor(symbolShape, symbolColor, backgroundShape, backgroundColor) {
        this.protocolId = 87;
        this.symbolShape = symbolShape;
        this.symbolColor = symbolColor;
        this.backgroundShape = backgroundShape;
        this.backgroundColor = backgroundColor;
    }
    serialize(buffer) {
        if (this.symbolShape < 0) {
            Logger.error("Forbidden value (" + this.symbolShape + ") on element symbolShape.");
        }
        buffer.writeVarShort(this.symbolShape);
        buffer.writeInt(this.symbolColor);
        if (this.backgroundShape < 0) {
            Logger.error("Forbidden value (" + this.backgroundShape + ") on element backgroundShape.");
        }
        buffer.writeByte(this.backgroundShape);
        buffer.writeInt(this.backgroundColor);
    }
    deserialize(buffer) {
        this.symbolShape = buffer.readVarUhShort();
        if (this.symbolShape < 0) {
            Logger.error("Forbidden value (" + this.symbolShape + ") on element of GuildEmblem.symbolShape.");
        }
        this.symbolColor = buffer.readInt();
        this.backgroundShape = buffer.readByte();
        if (this.backgroundShape < 0) {
            Logger.error("Forbidden value (" + this.backgroundShape + ") on element of GuildEmblem.backgroundShape.");
        }
        this.backgroundColor = buffer.readInt();
    }
}

export class GuildInformations extends BasicGuildInformations {
    constructor(param1, param2, param3, guildEmblem) {
        super(param1, param2, param3);
        this.protocolId = 127;
        this.guildEmblem = guildEmblem;
    }
    serialize(buffer) {
        super.serialize(buffer);
        this.guildEmblem.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guildEmblem = new GuildEmblem();
        this.guildEmblem.deserialize(buffer);
    }
}