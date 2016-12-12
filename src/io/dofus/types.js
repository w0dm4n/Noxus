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
            this.subentities[i].serialize(buffer);
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
    constructor(param1, param2, param3, entityLook) {
        super(param1, param2, param3);
        this.entityLook = entityLook;
        this.protocolId = 163;
    }
    serialize(buffer) {
        super.serialize(buffer);
        this.entityLook.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.entityLook = new EntityLook();
        this.entityLook.deserialize(buffer);
    }
}

export class CharacterBaseInformations extends CharacterMinimalPlusLookInformations {
    constructor(param1, param2, param3, param4, breed, sex) {
        super(param1, param2, param3, param4);
        this.breed = breed;
        this.sex = sex;
        this.protocolId = 45;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeByte(this.breed);
        buffer.writeBoolean(this.sex);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.breed = buffer.readByte();
        this.sex = buffer.readBoolean();
    }
}

export class GameContextActorInformations {
    constructor(contextualId, look, disposition) {
        this.contextualId = contextualId;
        this.look = look;
        this.disposition = disposition;
        this.protocolId = 150;
    }
    serialize(buffer) {
        if (this.contextualId < -9007199254740990 || this.contextualId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.contextualId + ") on element contextualId.");
        }
        buffer.writeDouble(this.contextualId);
        this.look.serialize(buffer);
        buffer.writeShort(this.disposition.protocolId);
        this.disposition.serialize(buffer);
    }
    deserialize(buffer) {
        this.contextualId = buffer.readDouble();
        if (this.contextualId < -9007199254740990 || this.contextualId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.contextualId + ") on element of GameContextActorInformations.contextualId.");
        }
        this.look = new EntityLook();
        this.look.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        this.disposition = ProtocolTypeManager.getInstance(com.ankamagames.dofus.network.types.game.context.EntityDispositionInformations, _loc2_);
        this.disposition.deserialize(buffer);
    }
}

export class GameRolePlayActorInformations extends GameContextActorInformations {
    constructor(param1, param2, param3) {
        super(param1, param2, param3);
        this.protocolId = 141;
    }
    serialize(buffer) {
        super.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class GameRolePlayNamedActorInformations extends GameRolePlayActorInformations {
    constructor(param1, param2, param3, name) {
        super(param1, param2, param3);
        this.name = name;
        this.protocolId = 154;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.name = buffer.readUTF();
    }
}

export class GameRolePlayHumanoidInformations extends GameRolePlayNamedActorInformations {
    constructor(param1, param2, param3, param4, humanoidInfo, accountId) {
        super(param1, param2, param3, param4);
        this.humanoidInfo = humanoidInfo;
        this.accountId = accountId;
        this.protocolId = 159;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeShort(this.humanoidInfo.protocolId);
        this.humanoidInfo.serialize(buffer);
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        buffer.writeInt(this.accountId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        this.humanoidInfo = ProtocolTypeManager.getInstance(com.ankamagames.dofus.network.types.game.context.roleplay.HumanInformations, _loc2_);
        this.humanoidInfo.deserialize(buffer);
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of GameRolePlayHumanoidInformations.accountId.");
        }
    }
}

export class GameRolePlayCharacterInformations extends GameRolePlayHumanoidInformations {
    constructor(param1, param2, param3, param4, param5, param6, alignmentInfos) {
        super(param1, param2, param3, param4, param5, param6);
        this.alignmentInfos = alignmentInfos;
        this.protocolId = 36;
    }
    serialize(buffer) {
        super.serialize(buffer);
        this.alignmentInfos.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.alignmentInfos = new ActorAlignmentInformations();
        this.alignmentInfos.deserialize(buffer);
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

export class Item {
    constructor() {
        this.protocolId = 7;
    }
    serialize(buffer) {
    }
    deserialize(buffer) {
    }
}

export class ObjectItemMinimalInformation extends Item {
    constructor(objectGID, effects) {
        super();
        this.objectGID = objectGID;
        this.effects = effects;
        this.protocolId = 124;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.objectGID < 0) {
            Logger.error("Forbidden value (" + this.objectGID + ") on element objectGID.");
        }
        buffer.writeVarShort(this.objectGID);
        buffer.writeShort(this.effects.length);
        var _loc2_ = 0;
        while (_loc2_ < this.effects.length) {
            this.effects[_loc2_].serialize(buffer);
            _loc2_++;
        }
    }
}
export class ObjectItemToSellInNpcShop extends ObjectItemMinimalInformation {
    constructor(param1, param2, objectPrice, buyCriterion) {
        super(param1, param2);
        this.objectPrice = objectPrice;
        this.buyCriterion = buyCriterion;
        this.protocolId = 352;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.objectPrice < 0) {
            Logger.error("Forbidden value (" + this.objectPrice + ") on element objectPrice.");
        }
        buffer.writeVarInt(this.objectPrice);
        buffer.writeUTF(this.buyCriterion);
    }
}
export class ObjectItem extends Item {
    constructor(position, objectGID, effects, objectUID, quantity) {
        super();
        this.position = position;
        this.objectGID = objectGID;
        this.effects = effects;
        this.objectUID = objectUID;
        this.quantity = quantity;
        this.protocolId = 37;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeByte(this.position);
        if (this.objectGID < 0) {
            Logger.error("Forbidden value (" + this.objectGID + ") on element objectGID.");
        }
        buffer.writeVarShort(this.objectGID);
        buffer.writeShort(this.effects.length);
        var _loc2_ = 0;
        while (_loc2_ < this.effects.length) {
            buffer.writeShort(this.effects[_loc2_].protocolId);
            this.effects[_loc2_].serialize(buffer);
            _loc2_++;
        }
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        buffer.writeVarInt(this.objectUID);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        super.deserialize(buffer);
        this.position = buffer.readUnsignedByte();
        if (this.position < 0 || this.position > 255) {
            Logger.error("Forbidden value (" + this.position + ") on element of ObjectItem.position.");
        }
        this.objectGID = buffer.readVarUhShort();
        if (this.objectGID < 0) {
            Logger.error("Forbidden value (" + this.objectGID + ") on element of ObjectItem.objectGID.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(ObjectEffect, _loc4_);
            _loc5_.deserialize(buffer);
            this.effects.push(_loc5_);
            _loc3_++;
        }
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectItem.objectUID.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectItem.quantity.");
        }
    }
}

export class ObjectEffect {
    constructor(actionId) {
        this.actionId = actionId;
        this.protocolId = 76;
    }
    serialize(buffer) {
        if (this.actionId < 0) {
            Logger.error("Forbidden value (" + this.actionId + ") on element actionId.");
        }
        buffer.writeVarShort(this.actionId);
    }
    deserialize(buffer) {
        this.actionId = buffer.readVarUhShort();
        if (this.actionId < 0) {
            Logger.error("Forbidden value (" + this.actionId + ") on element of ObjectEffect.actionId.");
        }
    }
}

export class ObjectEffectCreature extends ObjectEffect {
    constructor(param1, monsterFamilyId) {
        super(param1);
        this.monsterFamilyId = monsterFamilyId;
        this.protocolId = 71;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.monsterFamilyId < 0) {
            Logger.error("Forbidden value (" + this.monsterFamilyId + ") on element monsterFamilyId.");
        }
        buffer.writeVarShort(this.monsterFamilyId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.monsterFamilyId = buffer.readVarUhShort();
        if (this.monsterFamilyId < 0) {
            Logger.error("Forbidden value (" + this.monsterFamilyId + ") on element of ObjectEffectCreature.monsterFamilyId.");
        }
    }
}

export class ObjectEffectDate extends ObjectEffect {
    constructor(param1, year, month, day, hour, minute) {
        super(param1);
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.protocolId = 72;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.year < 0) {
            Logger.error("Forbidden value (" + this.year + ") on element year.");
        }
        buffer.writeVarShort(this.year);
        if (this.month < 0) {
            Logger.error("Forbidden value (" + this.month + ") on element month.");
        }
        buffer.writeByte(this.month);
        if (this.day < 0) {
            Logger.error("Forbidden value (" + this.day + ") on element day.");
        }
        buffer.writeByte(this.day);
        if (this.hour < 0) {
            Logger.error("Forbidden value (" + this.hour + ") on element hour.");
        }
        buffer.writeByte(this.hour);
        if (this.minute < 0) {
            Logger.error("Forbidden value (" + this.minute + ") on element minute.");
        }
        buffer.writeByte(this.minute);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.year = buffer.readVarUhShort();
        if (this.year < 0) {
            Logger.error("Forbidden value (" + this.year + ") on element of ObjectEffectDate.year.");
        }
        this.month = buffer.readByte();
        if (this.month < 0) {
            Logger.error("Forbidden value (" + this.month + ") on element of ObjectEffectDate.month.");
        }
        this.day = buffer.readByte();
        if (this.day < 0) {
            Logger.error("Forbidden value (" + this.day + ") on element of ObjectEffectDate.day.");
        }
        this.hour = buffer.readByte();
        if (this.hour < 0) {
            Logger.error("Forbidden value (" + this.hour + ") on element of ObjectEffectDate.hour.");
        }
        this.minute = buffer.readByte();
        if (this.minute < 0) {
            Logger.error("Forbidden value (" + this.minute + ") on element of ObjectEffectDate.minute.");
        }
    }
}

export class ObjectEffectDice extends ObjectEffect {
    constructor(param1, diceNum, diceSide, diceConst) {
        super(param1);
        this.diceNum = diceNum;
        this.diceSide = diceSide;
        this.diceConst = diceConst;
        this.protocolId = 73;
    }
    serialize(buffer) {
        super.serialize(buffer);

        if (this.diceNum < 0) {
            Logger.error("Forbidden value (" + this.diceNum + ") on element diceNum.");
        }
        buffer.writeVarShort(this.diceNum);
        if (this.diceSide < 0) {
            Logger.error("Forbidden value (" + this.diceSide + ") on element diceSide.");
        }
        buffer.writeVarShort(this.diceSide);
        if (this.diceConst < 0) {
            Logger.error("Forbidden value (" + this.diceConst + ") on element diceConst.");
        }
        buffer.writeVarShort(this.diceConst);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.diceNum = buffer.readVarUhShort();
        if (this.diceNum < 0) {
            Logger.error("Forbidden value (" + this.diceNum + ") on element of ObjectEffectDice.diceNum.");
        }
        this.diceSide = buffer.readVarUhShort();
        if (this.diceSide < 0) {
            Logger.error("Forbidden value (" + this.diceSide + ") on element of ObjectEffectDice.diceSide.");
        }
        this.diceConst = buffer.readVarUhShort();
        if (this.diceConst < 0) {
            Logger.error("Forbidden value (" + this.diceConst + ") on element of ObjectEffectDice.diceConst.");
        }
    }
}

export class ObjectEffectDuration extends ObjectEffect {
    constructor(param1, days, hours, minutes) {
        super(param1);
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
        this.protocolId = 75;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.days < 0) {
            Logger.error("Forbidden value (" + this.days + ") on element days.");
        }
        buffer.writeVarShort(this.days);
        if (this.hours < 0) {
            Logger.error("Forbidden value (" + this.hours + ") on element hours.");
        }
        buffer.writeByte(this.hours);
        if (this.minutes < 0) {
            Logger.error("Forbidden value (" + this.minutes + ") on element minutes.");
        }
        buffer.writeByte(this.minutes);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.days = buffer.readVarUhShort();
        if (this.days < 0) {
            Logger.error("Forbidden value (" + this.days + ") on element of ObjectEffectDuration.days.");
        }
        this.hours = buffer.readByte();
        if (this.hours < 0) {
            Logger.error("Forbidden value (" + this.hours + ") on element of ObjectEffectDuration.hours.");
        }
        this.minutes = buffer.readByte();
        if (this.minutes < 0) {
            Logger.error("Forbidden value (" + this.minutes + ") on element of ObjectEffectDuration.minutes.");
        }
    }
}

export class ObjectEffectInteger extends ObjectEffect {
    constructor(param1, value) {
        super(param1);
        this.value = value;
        this.protocolId = 70;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.value < 0) {
            Logger.error("Forbidden value (" + this.value + ") on element value.");
        }
        buffer.writeVarShort(this.value);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.value = buffer.readVarUhShort();
        if (this.value < 0) {
            Logger.error("Forbidden value (" + this.value + ") on element of ObjectEffectInteger.value.");
        }
    }
}

export class ObjectEffectLadder extends ObjectEffectCreature {
    constructor(param1, param2, monsterCount) {
        super(param1, param2);
        this.monsterCount = monsterCount;
        this.protocolId = 81;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.monsterCount < 0) {
            Logger.error("Forbidden value (" + this.monsterCount + ") on element monsterCount.");
        }
        buffer.writeVarInt(this.monsterCount);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.monsterCount = buffer.readVarUhInt();
        if (this.monsterCount < 0) {
            Logger.error("Forbidden value (" + this.monsterCount + ") on element of ObjectEffectLadder.monsterCount.");
        }
    }
}

export class ObjectEffectMinMax extends ObjectEffect {
    constructor(param1, min, max) {
        super(param1);
        this.min = min;
        this.max = max;
        this.protocolId = 82;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.min < 0) {
            Logger.error("Forbidden value (" + this.min + ") on element min.");
        }
        buffer.writeVarInt(this.min);
        if (this.max < 0) {
            Logger.error("Forbidden value (" + this.max + ") on element max.");
        }
        buffer.writeVarInt(this.max);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.min = buffer.readVarUhInt();
        if (this.min < 0) {
            Logger.error("Forbidden value (" + this.min + ") on element of ObjectEffectMinMax.min.");
        }
        this.max = buffer.readVarUhInt();
        if (this.max < 0) {
            Logger.error("Forbidden value (" + this.max + ") on element of ObjectEffectMinMax.max.");
        }
    }
}

export class ObjectEffectMount extends ObjectEffect {
    constructor(param1, mountId, date, modelId) {
        super(param1);
        this.mountId = mountId;
        this.date = date;
        this.modelId = modelId;
        this.protocolId = 179;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.mountId < 0) {
            Logger.error("Forbidden value (" + this.mountId + ") on element mountId.");
        }
        buffer.writeInt(this.mountId);
        if (this.date < -9007199254740990 || this.date > 9007199254740990) {
            Logger.error("Forbidden value (" + this.date + ") on element date.");
        }
        buffer.writeDouble(this.date);
        if (this.modelId < 0) {
            Logger.error("Forbidden value (" + this.modelId + ") on element modelId.");
        }
        buffer.writeVarShort(this.modelId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.mountId = buffer.readInt();
        if (this.mountId < 0) {
            Logger.error("Forbidden value (" + this.mountId + ") on element of ObjectEffectMount.mountId.");
        }
        this.date = buffer.readDouble();
        if (this.date < -9007199254740990 || this.date > 9007199254740990) {
            Logger.error("Forbidden value (" + this.date + ") on element of ObjectEffectMount.date.");
        }
        this.modelId = buffer.readVarUhShort();
        if (this.modelId < 0) {
            Logger.error("Forbidden value (" + this.modelId + ") on element of ObjectEffectMount.modelId.");
        }
    }
}

export class ObjectEffectString extends ObjectEffect {
    constructor(param1, value) {
        super(param1);
        this.value = value;
        this.protocolId = 74;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeUTF(this.value);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.value = buffer.readUTF();
    }
}
export class InteractiveElement{
constructor(elementId,elementTypeId,enabledSkills,disabledSkills,onCurrentMap) {
this.elementId = elementId;
this.elementTypeId = elementTypeId;
this.enabledSkills = enabledSkills;
this.disabledSkills = disabledSkills;
this.onCurrentMap = onCurrentMap;
this.protocolId  = 80;
}
serialize(buffer){
         if(this.elementId < 0)
         {
            Logger.error("Forbidden value (" + this.elementId + ") on element elementId.");
         }
  
         buffer.writeInt(this.elementId);
         buffer.writeInt(this.elementTypeId);
         buffer.writeShort(this.enabledSkills.length);
         var _loc2_ =  0;
         while(_loc2_ < this.enabledSkills.length)
         {
            buffer.writeShort(this.enabledSkills[_loc2_].protocolId);
            this.enabledSkills[_loc2_].serialize(buffer);

            _loc2_++;
         }
         buffer.writeShort(this.disabledSkills.length);
         var _loc3_ =  0;
         while(_loc3_ < this.disabledSkills.length)
         {
            buffer.writeShort(this.disabledSkills[_loc2_].protocolId);

this.disabledSkills[_loc3_].serialize(buffer);
            _loc3_++;
         }
         buffer.writeBoolean(this.onCurrentMap);
}
}
export class InteractiveElementSkill{
constructor(skillId,skillInstanceUid) {
this.skillId = skillId;
this.skillInstanceUid = skillInstanceUid;
this.protocolId  = 219;
}
serialize(buffer){
         if(this.skillId < 0)
         {
            Logger.error("Forbidden value (" + this.skillId + ") on element skillId.");
         }
         buffer.writeVarInt(this.skillId);
         if(this.skillInstanceUid < 0)
         {
            Logger.error("Forbidden value (" + this.skillInstanceUid + ") on element skillInstanceUid.");
         }
         buffer.writeInt(this.skillInstanceUid);
}

}

export class IgnoredInformations extends AbstractContactInformations {
    constructor(param1, param2) {
        super(param1, param2);
        this.protocolId = 106;
    }
    serialize(buffer) {
        super.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class IgnoredOnlineInformations extends IgnoredInformations {
    constructor(param1, param2, playerId, playerName, breed, sex) {
        super(param1, param2);
        this.playerId = playerId;
        this.playerName = playerName;
        this.breed = breed;
        this.sex = sex;
        this.protocolId = 105;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element playerId.");
        }
        buffer.writeVarLong(this.playerId);
        buffer.writeUTF(this.playerName);
        buffer.writeByte(this.breed);
        buffer.writeBoolean(this.sex);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.playerId = buffer.readVarUhLong();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element of IgnoredOnlineInformations.playerId.");
        }
        this.playerName = buffer.readUTF();
        this.breed = buffer.readByte();
        if (this.breed < PlayableBreedEnum.Feca || this.breed > PlayableBreedEnum.Huppermage) {
            Logger.error("Forbidden value (" + this.breed + ") on element of IgnoredOnlineInformations.breed.");
        }
        this.sex = buffer.readBoolean();
    }
}

export class SubEntity {
    constructor(bindingPointCategory, bindingPointIndex, subEntityLook) {
        this.bindingPointCategory = bindingPointCategory;
        this.bindingPointIndex = bindingPointIndex;
        this.subEntityLook = subEntityLook;
        this.protocolId = 54;
    }
    serialize(buffer) {
        buffer.writeByte(this.bindingPointCategory);
        buffer.writeByte(this.bindingPointIndex);
        this.subEntityLook.serialize(buffer);
    }
    deserialize(buffer) {
        this.bindingPointCategory = buffer.readByte();
        if (this.bindingPointCategory < 0) {
            Logger.error("Forbidden value (" + this.bindingPointCategory + ") on element of SubEntity.bindingPointCategory.");
        }
        this.bindingPointIndex = buffer.readByte();
        if (this.bindingPointIndex < 0) {
            Logger.error("Forbidden value (" + this.bindingPointIndex + ") on element of SubEntity.bindingPointIndex.");
        }
        this.subEntityLook = new Types.EntityLook();
        this.subEntityLook.deserialize(buffer);
    }
}

export class SpellItem extends Item {
    constructor(spellId, spellLevel) {
        super();
        this.spellId = spellId;
        this.spellLevel = spellLevel;
        this.protocolId = 49;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeInt(this.spellId);
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element spellLevel.");
        }
        buffer.writeShort(this.spellLevel);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.spellId = buffer.readInt();
        this.spellLevel = buffer.readShort();
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element of SpellItem.spellLevel.");
        }
    }
}


export class PartyMemberInformations extends CharacterBaseInformations {
    constructor(param1, param2, param3, param4, param5, param6, lifePoints, maxLifePoints, prospecting, regenRate, initiative, alignmentSide, worldX, worldY, mapId, subAreaId, status, companions) {
        super(param1, param2, param3, param4, param5, param6);
        this.lifePoints = lifePoints;
        this.maxLifePoints = maxLifePoints;
        this.prospecting = prospecting;
        this.regenRate = regenRate;
        this.initiative = initiative;
        this.alignmentSide = alignmentSide;
        this.worldX = worldX;
        this.worldY = worldY;
        this.mapId = mapId;
        this.subAreaId = subAreaId;
        this.status = status;
        this.companions = companions;
        this.protocolId = 90;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element lifePoints.");
        }
        buffer.writeVarInt(this.lifePoints);
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element maxLifePoints.");
        }
        buffer.writeVarInt(this.maxLifePoints);
        if (this.prospecting < 0) {
            Logger.error("Forbidden value (" + this.prospecting + ") on element prospecting.");
        }
        buffer.writeVarShort(this.prospecting);
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element regenRate.");
        }
        buffer.writeByte(this.regenRate);
        if (this.initiative < 0) {
            Logger.error("Forbidden value (" + this.initiative + ") on element initiative.");
        }
        buffer.writeVarShort(this.initiative);
        buffer.writeByte(this.alignmentSide);
        if (this.worldX < -255 || this.worldX > 255) {
            Logger.error("Forbidden value (" + this.worldX + ") on element worldX.");
        }
        buffer.writeShort(this.worldX);
        if (this.worldY < -255 || this.worldY > 255) {
            Logger.error("Forbidden value (" + this.worldY + ") on element worldY.");
        }
        buffer.writeShort(this.worldY);
        buffer.writeInt(this.mapId);
        if (this.subAreaId < 0) {
            Logger.error("Forbidden value (" + this.subAreaId + ") on element subAreaId.");
        }
        buffer.writeVarShort(this.subAreaId);
        buffer.writeShort(this.status.protocolId);
        this.status.serialize(buffer);
        buffer.writeShort(this.companions.length);
        var _loc2_ = 0;
        while (_loc2_ < this.companions.length) {
            this.companions[_loc2_].serialize(buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc5_ = null;
        super.deserialize(buffer);
        this.lifePoints = buffer.readVarUhInt();
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element of PartyMemberInformations.lifePoints.");
        }
        this.maxLifePoints = buffer.readVarUhInt();
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element of PartyMemberInformations.maxLifePoints.");
        }
        this.prospecting = buffer.readVarUhShort();
        if (this.prospecting < 0) {
            Logger.error("Forbidden value (" + this.prospecting + ") on element of PartyMemberInformations.prospecting.");
        }
        this.regenRate = buffer.readUnsignedByte();
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element of PartyMemberInformations.regenRate.");
        }
        this.initiative = buffer.readVarUhShort();
        if (this.initiative < 0) {
            Logger.error("Forbidden value (" + this.initiative + ") on element of PartyMemberInformations.initiative.");
        }
        this.alignmentSide = buffer.readByte();
        this.worldX = buffer.readShort();
        if (this.worldX < -255 || this.worldX > 255) {
            Logger.error("Forbidden value (" + this.worldX + ") on element of PartyMemberInformations.worldX.");
        }
        this.worldY = buffer.readShort();
        if (this.worldY < -255 || this.worldY > 255) {
            Logger.error("Forbidden value (" + this.worldY + ") on element of PartyMemberInformations.worldY.");
        }
        this.mapId = buffer.readInt();
        this.subAreaId = buffer.readVarUhShort();
        if (this.subAreaId < 0) {
            Logger.error("Forbidden value (" + this.subAreaId + ") on element of PartyMemberInformations.subAreaId.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        this.status = ProtocolTypeManager.getInstance(PlayerStatus, _loc2_);
        this.status.deserialize(buffer);
        var _loc3_ = buffer.readUnsignedShort();
        var _loc4_ = 0;
        while (_loc4_ < _loc3_) {
            _loc5_ = new PartyCompanionMemberInformations();
            _loc5_.deserialize(buffer);
            this.companions.push(_loc5_);
            _loc4_++;
        }
    }
}

export class PartyCompanionBaseInformations {
    constructor(indexId, companionGenericId, entityLook) {
        this.indexId = indexId;
        this.companionGenericId = companionGenericId;
        this.entityLook = entityLook;
        this.protocolId = 453;
    }
    serialize(buffer) {
        if (this.indexId < 0) {
            Logger.error("Forbidden value (" + this.indexId + ") on element indexId.");
        }
        buffer.writeByte(this.indexId);
        if (this.companionGenericId < 0) {
            Logger.error("Forbidden value (" + this.companionGenericId + ") on element companionGenericId.");
        }
        buffer.writeByte(this.companionGenericId);
        this.entityLook.serialize(buffer);
    }
    deserialize(buffer) {
        this.indexId = buffer.readByte();
        if (this.indexId < 0) {
            Logger.error("Forbidden value (" + this.indexId + ") on element of PartyCompanionBaseInformations.indexId.");
        }
        this.companionGenericId = buffer.readByte();
        if (this.companionGenericId < 0) {
            Logger.error("Forbidden value (" + this.companionGenericId + ") on element of PartyCompanionBaseInformations.companionGenericId.");
        }
        this.entityLook = new EntityLook();
        this.entityLook.deserialize(buffer);
    }
}

export class PartyCompanionMemberInformations extends PartyCompanionBaseInformations {
    constructor(param1, param2, param3, initiative, lifePoints, maxLifePoints, prospecting, regenRate) {
        super(param1, param2, param3);
        this.initiative = initiative;
        this.lifePoints = lifePoints;
        this.maxLifePoints = maxLifePoints;
        this.prospecting = prospecting;
        this.regenRate = regenRate;
        this.protocolId = 452;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.initiative < 0) {
            Logger.error("Forbidden value (" + this.initiative + ") on element initiative.");
        }
        buffer.writeVarShort(this.initiative);
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element lifePoints.");
        }
        buffer.writeVarInt(this.lifePoints);
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element maxLifePoints.");
        }
        buffer.writeVarInt(this.maxLifePoints);
        if (this.prospecting < 0) {
            Logger.error("Forbidden value (" + this.prospecting + ") on element prospecting.");
        }
        buffer.writeVarShort(this.prospecting);
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element regenRate.");
        }
        buffer.writeByte(this.regenRate);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.initiative = buffer.readVarUhShort();
        if (this.initiative < 0) {
            Logger.error("Forbidden value (" + this.initiative + ") on element of PartyCompanionMemberInformations.initiative.");
        }
        this.lifePoints = buffer.readVarUhInt();
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element of PartyCompanionMemberInformations.lifePoints.");
        }
        this.maxLifePoints = buffer.readVarUhInt();
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element of PartyCompanionMemberInformations.maxLifePoints.");
        }
        this.prospecting = buffer.readVarUhShort();
        if (this.prospecting < 0) {
            Logger.error("Forbidden value (" + this.prospecting + ") on element of PartyCompanionMemberInformations.prospecting.");
        }
        this.regenRate = buffer.readUnsignedByte();
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element of PartyCompanionMemberInformations.regenRate.");
        }
    }
}

export class PartyGuestInformations {
    constructor(guestId, hostId, name, guestLook, breed, sex, status, companions) {
        this.guestId = guestId;
        this.hostId = hostId;
        this.name = name;
        this.guestLook = guestLook;
        this.breed = breed;
        this.sex = sex;
        this.status = status;
        this.companions = companions;
        this.protocolId = 374;
    }
    serialize(buffer) {
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element guestId.");
        }
        buffer.writeVarLong(this.guestId);
        if (this.hostId < 0 || this.hostId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.hostId + ") on element hostId.");
        }
        buffer.writeVarLong(this.hostId);
        buffer.writeUTF(this.name);
        this.guestLook.serialize(buffer);
        buffer.writeByte(this.breed);
        buffer.writeBoolean(this.sex);
        buffer.writeShort(this.status.protocolId);
        this.status.serialize(buffer);
        buffer.writeShort(this.companions.length);
        var _loc2_ = 0;
        while (_loc2_ < this.companions.length) {
            this.companions[_loc2_].serialize(buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc5_ = null;
        this.guestId = buffer.readVarUhLong();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element of PartyGuestInformations.guestId.");
        }
        this.hostId = buffer.readVarUhLong();
        if (this.hostId < 0 || this.hostId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.hostId + ") on element of PartyGuestInformations.hostId.");
        }
        this.name = buffer.readUTF();
        this.guestLook = new EntityLook();
        this.guestLook.deserialize(buffer);
        this.breed = buffer.readByte();
        this.sex = buffer.readBoolean();
        var _loc2_ = buffer.readUnsignedShort();
        this.status = ProtocolTypeManager.getInstance(PlayerStatus, _loc2_);
        this.status.deserialize(buffer);
        var _loc3_ = buffer.readUnsignedShort();
        var _loc4_ = 0;
        while (_loc4_ < _loc3_) {
            _loc5_ = new PartyCompanionBaseInformations();
            _loc5_.deserialize(buffer);
            this.companions.push(_loc5_);
            _loc4_++;
        }
    }
}

export class GameFightFighterInformations extends GameContextActorInformations {
    constructor(param1, param2, param3, teamId, wave, alive, stats, previousPositions) {
        super(param1, param2, param3);
        this.teamId = teamId;
        this.wave = wave;
        this.alive = alive;
        this.stats = stats;
        this.previousPositions = previousPositions;
        this.protocolId = 143;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeByte(this.teamId);
        if (this.wave < 0) {
            Logger.error("Forbidden value (" + this.wave + ") on element wave.");
        }
        buffer.writeByte(this.wave);
        buffer.writeBoolean(this.alive);
        buffer.writeShort(this.stats.protocolId);
        this.stats.serialize(buffer);
        buffer.writeShort(this.previousPositions.length);
        var _loc2_ = 0;
        while (_loc2_ < this.previousPositions.length) {
            if (this.previousPositions[_loc2_] < 0 || this.previousPositions[_loc2_] > 559) {
                Logger.error("Forbidden value (" + this.previousPositions[_loc2_] + ") on element 5 (starting at 1) of previousPositions.");
            }
            buffer.writeVarShort(this.previousPositions[_loc2_]);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc5_ = 0;
        super.deserialize(buffer);
        this.teamId = buffer.readByte();
        if (this.teamId < 0) {
            Logger.error("Forbidden value (" + this.teamId + ") on element of GameFightFighterInformations.teamId.");
        }
        this.wave = buffer.readByte();
        if (this.wave < 0) {
            Logger.error("Forbidden value (" + this.wave + ") on element of GameFightFighterInformations.wave.");
        }
        this.alive = buffer.readBoolean();
        var _loc2_ = buffer.readUnsignedShort();
        this.stats = ProtocolTypeManager.getInstance(com.ankamagames.dofus.network.types.game.context.fight.GameFightMinimalStats, _loc2_);
        this.stats.deserialize(buffer);
        var _loc3_ = buffer.readUnsignedShort();
        var _loc4_ = 0;
        while (_loc4_ < _loc3_) {
            _loc5_ = buffer.readVarUhShort();
            if (_loc5_ < 0 || _loc5_ > 559) {
                Logger.error("Forbidden value (" + _loc5_ + ") on elements of previousPositions.");
            }
            this.previousPositions.push(_loc5_);
            _loc4_++;
        }
    }
}

export class GameFightFighterNamedInformations extends GameFightFighterInformations {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8, name, status) {
        super(param1, param2, param3, param4, param5, param6, param7, param8);
        this.name = name;
        this.status = status;
        this.protocolId = 158;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeUTF(this.name);
        this.status.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.name = buffer.readUTF();
        this.status = new PlayerStatus();
        this.status.deserialize(buffer);
    }
}

export class GameFightMutantInformations extends GameFightFighterNamedInformations {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, powerLevel) {
        super(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10);
        this.powerLevel = powerLevel;
        this.protocolId = 50;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.powerLevel < 0) {
            Logger.error("Forbidden value (" + this.powerLevel + ") on element powerLevel.");
        }
        buffer.writeByte(this.powerLevel);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.powerLevel = buffer.readByte();
        if (this.powerLevel < 0) {
            Logger.error("Forbidden value (" + this.powerLevel + ") on element of GameFightMutantInformations.powerLevel.");
        }
    }
}

export class GameFightCharacterInformations extends GameFightFighterNamedInformations {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, level, alignmentInfos, breed, sex) {
        super(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10);
        this.level = level;
        this.alignmentInfos = alignmentInfos;
        this.breed = breed;
        this.sex = sex;
        this.protocolId = 46;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.level < 0 || this.level > 255) {
            Logger.error("Forbidden value (" + this.level + ") on element level.");
        }
        buffer.writeByte(this.level);
        this.alignmentInfos.serialize(buffer);
        buffer.writeByte(this.breed);
        buffer.writeBoolean(this.sex);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.level = buffer.readUnsignedByte();
        if (this.level < 0 || this.level > 255) {
            Logger.error("Forbidden value (" + this.level + ") on element of GameFightCharacterInformations.level.");
        }
        this.alignmentInfos = new ActorAlignmentInformations();
        this.alignmentInfos.deserialize(buffer);
        this.breed = buffer.readByte();
        this.sex = buffer.readBoolean();
    }
}


export class GameFightMinimalStats {
    constructor(lifePoints, maxLifePoints, baseMaxLifePoints, permanentDamagePercent, shieldPoints, actionPoints, maxActionPoints, movementPoints, maxMovementPoints, summoner, summoned, neutralElementResistPercent, earthElementResistPercent, waterElementResistPercent, airElementResistPercent, fireElementResistPercent, neutralElementReduction, earthElementReduction, waterElementReduction, airElementReduction, fireElementReduction, criticalDamageFixedResist, pushDamageFixedResist, pvpNeutralElementResistPercent, pvpEarthElementResistPercent, pvpWaterElementResistPercent, pvpAirElementResistPercent, pvpFireElementResistPercent, pvpNeutralElementReduction, pvpEarthElementReduction, pvpWaterElementReduction, pvpAirElementReduction, pvpFireElementReduction, dodgePALostProbability, dodgePMLostProbability, tackleBlock, tackleEvade, fixedDamageReflection, invisibilityState) {
        this.lifePoints = lifePoints;
        this.maxLifePoints = maxLifePoints;
        this.baseMaxLifePoints = baseMaxLifePoints;
        this.permanentDamagePercent = permanentDamagePercent;
        this.shieldPoints = shieldPoints;
        this.actionPoints = actionPoints;
        this.maxActionPoints = maxActionPoints;
        this.movementPoints = movementPoints;
        this.maxMovementPoints = maxMovementPoints;
        this.summoner = summoner;
        this.summoned = summoned;
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
        this.criticalDamageFixedResist = criticalDamageFixedResist;
        this.pushDamageFixedResist = pushDamageFixedResist;
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
        this.dodgePALostProbability = dodgePALostProbability;
        this.dodgePMLostProbability = dodgePMLostProbability;
        this.tackleBlock = tackleBlock;
        this.tackleEvade = tackleEvade;
        this.fixedDamageReflection = fixedDamageReflection;
        this.invisibilityState = invisibilityState;
        this.protocolId = 31;
    }
    serialize(buffer) {
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element lifePoints.");
        }
        buffer.writeVarInt(this.lifePoints);
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element maxLifePoints.");
        }
        buffer.writeVarInt(this.maxLifePoints);
        if (this.baseMaxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.baseMaxLifePoints + ") on element baseMaxLifePoints.");
        }
        buffer.writeVarInt(this.baseMaxLifePoints);
        if (this.permanentDamagePercent < 0) {
            Logger.error("Forbidden value (" + this.permanentDamagePercent + ") on element permanentDamagePercent.");
        }
        buffer.writeVarInt(this.permanentDamagePercent);
        if (this.shieldPoints < 0) {
            Logger.error("Forbidden value (" + this.shieldPoints + ") on element shieldPoints.");
        }
        buffer.writeVarInt(this.shieldPoints);
        buffer.writeVarShort(this.actionPoints);
        buffer.writeVarShort(this.maxActionPoints);
        buffer.writeVarShort(this.movementPoints);
        buffer.writeVarShort(this.maxMovementPoints);
        if (this.summoner < -9007199254740990 || this.summoner > 9007199254740990) {
            Logger.error("Forbidden value (" + this.summoner + ") on element summoner.");
        }
        buffer.writeDouble(this.summoner);
        buffer.writeBoolean(this.summoned);
        buffer.writeVarShort(this.neutralElementResistPercent);
        buffer.writeVarShort(this.earthElementResistPercent);
        buffer.writeVarShort(this.waterElementResistPercent);
        buffer.writeVarShort(this.airElementResistPercent);
        buffer.writeVarShort(this.fireElementResistPercent);
        buffer.writeVarShort(this.neutralElementReduction);
        buffer.writeVarShort(this.earthElementReduction);
        buffer.writeVarShort(this.waterElementReduction);
        buffer.writeVarShort(this.airElementReduction);
        buffer.writeVarShort(this.fireElementReduction);
        buffer.writeVarShort(this.criticalDamageFixedResist);
        buffer.writeVarShort(this.pushDamageFixedResist);
        buffer.writeVarShort(this.pvpNeutralElementResistPercent);
        buffer.writeVarShort(this.pvpEarthElementResistPercent);
        buffer.writeVarShort(this.pvpWaterElementResistPercent);
        buffer.writeVarShort(this.pvpAirElementResistPercent);
        buffer.writeVarShort(this.pvpFireElementResistPercent);
        buffer.writeVarShort(this.pvpNeutralElementReduction);
        buffer.writeVarShort(this.pvpEarthElementReduction);
        buffer.writeVarShort(this.pvpWaterElementReduction);
        buffer.writeVarShort(this.pvpAirElementReduction);
        buffer.writeVarShort(this.pvpFireElementReduction);
        if (this.dodgePALostProbability < 0) {
            Logger.error("Forbidden value (" + this.dodgePALostProbability + ") on element dodgePALostProbability.");
        }
        buffer.writeVarShort(this.dodgePALostProbability);
        if (this.dodgePMLostProbability < 0) {
            Logger.error("Forbidden value (" + this.dodgePMLostProbability + ") on element dodgePMLostProbability.");
        }
        buffer.writeVarShort(this.dodgePMLostProbability);
        buffer.writeVarShort(this.tackleBlock);
        buffer.writeVarShort(this.tackleEvade);
        buffer.writeVarShort(this.fixedDamageReflection);
        buffer.writeByte(this.invisibilityState);
    }
    deserialize(buffer) {
        this.lifePoints = buffer.readVarUhInt();
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element of GameFightMinimalStats.lifePoints.");
        }
        this.maxLifePoints = buffer.readVarUhInt();
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element of GameFightMinimalStats.maxLifePoints.");
        }
        this.baseMaxLifePoints = buffer.readVarUhInt();
        if (this.baseMaxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.baseMaxLifePoints + ") on element of GameFightMinimalStats.baseMaxLifePoints.");
        }
        this.permanentDamagePercent = buffer.readVarUhInt();
        if (this.permanentDamagePercent < 0) {
            Logger.error("Forbidden value (" + this.permanentDamagePercent + ") on element of GameFightMinimalStats.permanentDamagePercent.");
        }
        this.shieldPoints = buffer.readVarUhInt();
        if (this.shieldPoints < 0) {
            Logger.error("Forbidden value (" + this.shieldPoints + ") on element of GameFightMinimalStats.shieldPoints.");
        }
        this.actionPoints = buffer.readVarShort();
        this.maxActionPoints = buffer.readVarShort();
        this.movementPoints = buffer.readVarShort();
        this.maxMovementPoints = buffer.readVarShort();
        this.summoner = buffer.readDouble();
        if (this.summoner < -9007199254740990 || this.summoner > 9007199254740990) {
            Logger.error("Forbidden value (" + this.summoner + ") on element of GameFightMinimalStats.summoner.");
        }
        this.summoned = buffer.readBoolean();
        this.neutralElementResistPercent = buffer.readVarShort();
        this.earthElementResistPercent = buffer.readVarShort();
        this.waterElementResistPercent = buffer.readVarShort();
        this.airElementResistPercent = buffer.readVarShort();
        this.fireElementResistPercent = buffer.readVarShort();
        this.neutralElementReduction = buffer.readVarShort();
        this.earthElementReduction = buffer.readVarShort();
        this.waterElementReduction = buffer.readVarShort();
        this.airElementReduction = buffer.readVarShort();
        this.fireElementReduction = buffer.readVarShort();
        this.criticalDamageFixedResist = buffer.readVarShort();
        this.pushDamageFixedResist = buffer.readVarShort();
        this.pvpNeutralElementResistPercent = buffer.readVarShort();
        this.pvpEarthElementResistPercent = buffer.readVarShort();
        this.pvpWaterElementResistPercent = buffer.readVarShort();
        this.pvpAirElementResistPercent = buffer.readVarShort();
        this.pvpFireElementResistPercent = buffer.readVarShort();
        this.pvpNeutralElementReduction = buffer.readVarShort();
        this.pvpEarthElementReduction = buffer.readVarShort();
        this.pvpWaterElementReduction = buffer.readVarShort();
        this.pvpAirElementReduction = buffer.readVarShort();
        this.pvpFireElementReduction = buffer.readVarShort();
        this.dodgePALostProbability = buffer.readVarUhShort();
        if (this.dodgePALostProbability < 0) {
            Logger.error("Forbidden value (" + this.dodgePALostProbability + ") on element of GameFightMinimalStats.dodgePALostProbability.");
        }
        this.dodgePMLostProbability = buffer.readVarUhShort();
        if (this.dodgePMLostProbability < 0) {
            Logger.error("Forbidden value (" + this.dodgePMLostProbability + ") on element of GameFightMinimalStats.dodgePMLostProbability.");
        }
        this.tackleBlock = buffer.readVarShort();
        this.tackleEvade = buffer.readVarShort();
        this.fixedDamageReflection = buffer.readVarShort();
        this.invisibilityState = buffer.readByte();
        if (this.invisibilityState < 0) {
            Logger.error("Forbidden value (" + this.invisibilityState + ") on element of GameFightMinimalStats.invisibilityState.");
        }
    }
}

// Generated by Noxus types
export class GameFightMinimalStatsPreparation extends GameFightMinimalStats {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12, param13, param14, param15, param16, param17, param18, param19, param20, param21, param22, param23, param24, param25, param26, param27, param28, param29, param30, param31, param32, param33, param34, param35, param36, param37, param38, param39, initiative) {
        super(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12, param13, param14, param15, param16, param17, param18, param19, param20, param21, param22, param23, param24, param25, param26, param27, param28, param29, param30, param31, param32, param33, param34, param35, param36, param37, param38, param39);
        this.initiative = initiative;
        this.protocolId = 360;
    }

    serialize(buffer) {
        super.serialize(buffer);
        if (this.initiative < 0) {
            Logger.error("Forbidden value (" + this.initiative + ") on element initiative.");
        }
        buffer.writeVarInt(this.initiative);
    }

    deserialize(buffer) {
        super.deserialize(buffer);
        this.initiative = buffer.readVarUhInt();
        if (this.initiative < 0) {
            Logger.error("Forbidden value (" + this.initiative + ") on element of GameFightMinimalStatsPreparation.initiative.");
        }
    }
}

export class IdentifiedEntityDispositionInformations extends EntityDispositionInformations {
    constructor(param1, param2, id) {
        super(param1, param2);
        this.id = id;
        this.protocolId = 107;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        buffer.writeDouble(this.id);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of IdentifiedEntityDispositionInformations.id.");
        }
    }
}

export class FightCommonInformations {
    constructor(fightId, fightType, fightTeams, fightTeamsPositions, fightTeamsOptions) {
        this.fightId = fightId;
        this.fightType = fightType;
        this.fightTeams = fightTeams;
        this.fightTeamsPositions = fightTeamsPositions;
        this.fightTeamsOptions = fightTeamsOptions;
        this.protocolId = 43;
    }
    serialize(buffer) {
        buffer.writeInt(this.fightId);
        buffer.writeByte(this.fightType);
        buffer.writeShort(this.fightTeams.length);
        var _loc2_ = 0;
        while (_loc2_ < this.fightTeams.length) {
            buffer.writeShort(this.fightTeams[_loc2_].protocolId);
            this.fightTeams[_loc2_].serialize(buffer);
            _loc2_++;
        }
        buffer.writeShort(this.fightTeamsPositions.length);
        var _loc3_ = 0;
        while (_loc3_ < this.fightTeamsPositions.length) {
            if (this.fightTeamsPositions[_loc3_] < 0 || this.fightTeamsPositions[_loc3_] > 559) {
                Logger.error("Forbidden value (" + this.fightTeamsPositions[_loc3_] + ") on element 4 (starting at 1) of fightTeamsPositions.");
            }
            buffer.writeVarShort(this.fightTeamsPositions[_loc3_]);
            _loc3_++;
        }
        buffer.writeShort(this.fightTeamsOptions.length);
        var _loc4_ = 0;
        while (_loc4_ < this.fightTeamsOptions.length) {
            this.fightTeamsOptions[_loc4_].serialize(buffer);
            _loc4_++;
        }
    }
    deserialize(buffer) {
        var _loc8_ = 0;
        var _loc9_ = null;
        var _loc10_ = 0;
        var _loc11_ = null;
        this.fightId = buffer.readInt();
        this.fightType = buffer.readByte();
        if (this.fightType < 0) {
            Logger.error("Forbidden value (" + this.fightType + ") on element of FightCommonInformations.fightType.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc8_ = buffer.readUnsignedShort();
            _loc9_ = ProtocolTypeManager.getInstance(com.ankamagames.dofus.network.types.game.context.fight.FightTeamInformations, _loc8_);
            _loc9_.deserialize(buffer);
            this.fightTeams.push(_loc9_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc10_ = buffer.readVarUhShort();
            if (_loc10_ < 0 || _loc10_ > 559) {
                Logger.error("Forbidden value (" + _loc10_ + ") on elements of fightTeamsPositions.");
            }
            this.fightTeamsPositions.push(_loc10_);
            _loc5_++;
        }
        var _loc6_ = buffer.readUnsignedShort();
        var _loc7_ = 0;
        while (_loc7_ < _loc6_) {
            _loc11_ = new Types.FightOptionsInformations();
            _loc11_.deserialize(buffer);
            this.fightTeamsOptions.push(_loc11_);
            _loc7_++;
        }
    }
}

export class AbstractFightTeamInformations {
    constructor(teamId, leaderId, teamSide, teamTypeId, nbWaves) {
        this.teamId = teamId;
        this.leaderId = leaderId;
        this.teamSide = teamSide;
        this.teamTypeId = teamTypeId;
        this.nbWaves = nbWaves;
        this.protocolId = 116;
    }
    serialize(buffer) {
        buffer.writeByte(this.teamId);
        if (this.leaderId < -9007199254740990 || this.leaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leaderId + ") on element leaderId.");
        }
        buffer.writeDouble(this.leaderId);
        buffer.writeByte(this.teamSide);
        buffer.writeByte(this.teamTypeId);
        if (this.nbWaves < 0) {
            Logger.error("Forbidden value (" + this.nbWaves + ") on element nbWaves.");
        }
        buffer.writeByte(this.nbWaves);
    }
    deserialize(buffer) {
        this.teamId = buffer.readByte();
        if (this.teamId < 0) {
            Logger.error("Forbidden value (" + this.teamId + ") on element of AbstractFightTeamInformations.teamId.");
        }
        this.leaderId = buffer.readDouble();
        if (this.leaderId < -9007199254740990 || this.leaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leaderId + ") on element of AbstractFightTeamInformations.leaderId.");
        }
        this.teamSide = buffer.readByte();
        this.teamTypeId = buffer.readByte();
        if (this.teamTypeId < 0) {
            Logger.error("Forbidden value (" + this.teamTypeId + ") on element of AbstractFightTeamInformations.teamTypeId.");
        }
        this.nbWaves = buffer.readByte();
        if (this.nbWaves < 0) {
            Logger.error("Forbidden value (" + this.nbWaves + ") on element of AbstractFightTeamInformations.nbWaves.");
        }
    }
}

export class FightTeamInformations extends AbstractFightTeamInformations {
    constructor(param1, param2, param3, param4, param5, teamMembers) {
        super(param1, param2, param3, param4, param5);
        this.teamMembers = teamMembers;
        this.protocolId = 33;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeShort(this.teamMembers.length);
        var _loc2_ = 0;
        while (_loc2_ < this.teamMembers.length) {
            buffer.writeShort(this.teamMembers[_loc2_].protocolId);
            this.teamMembers[_loc2_].serialize(buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        super.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(com.ankamagames.dofus.network.types.game.context.fight.FightTeamMemberInformations, _loc4_);
            _loc5_.deserialize(buffer);
            this.teamMembers.push(_loc5_);
            _loc3_++;
        }
    }
}

export class FightOptionsInformations {
    constructor(isSecret, isRestrictedToPartyOnly, isClosed, isAskingForHelp) {
        this.isSecret = isSecret;
        this.isRestrictedToPartyOnly = isRestrictedToPartyOnly;
        this.isClosed = isClosed;
        this.isAskingForHelp = isAskingForHelp;
        this.protocolId = 20;
    }
    serialize(buffer) {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.isSecret);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.isRestrictedToPartyOnly);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 2, this.isClosed);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 3, this.isAskingForHelp);
        buffer.writeByte(_loc2_);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.isSecret = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.isRestrictedToPartyOnly = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.isClosed = IO.BooleanByteWrapper.getFlag(_loc2_, 2);
        this.isAskingForHelp = IO.BooleanByteWrapper.getFlag(_loc2_, 3);
    }
}

export class FightTeamMemberInformations {
    constructor(id) {
        this.id = id;
        this.protocolId = 44;
    }
    serialize(buffer) {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        buffer.writeDouble(this.id);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of FightTeamMemberInformations.id.");
        }
    }
}

export class FightTeamMemberCharacterInformations extends FightTeamMemberInformations {
    constructor(param1, name, level) {
        super(param1);
        this.name = name;
        this.level = level;
        this.protocolId = 13;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeUTF(this.name);
        if (this.level < 0 || this.level > 255) {
            Logger.error("Forbidden value (" + this.level + ") on element level.");
        }
        buffer.writeByte(this.level);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.name = buffer.readUTF();
        this.level = buffer.readUnsignedByte();
        if (this.level < 0 || this.level > 255) {
            Logger.error("Forbidden value (" + this.level + ") on element of FightTeamMemberCharacterInformations.level.");
        }
    }
}

export class NamedPartyTeamWithOutcome {
    constructor(team, outcome) {
        this.team = team;
        this.outcome = outcome;
        this.protocolId = 470;
    }
    serialize(buffer) {
        this.team.serialize(buffer);
        buffer.writeVarShort(this.outcome);
    }
    deserialize(buffer) {
        this.team = new Types.NamedPartyTeam();
        this.team.deserialize(buffer);
        this.outcome = buffer.readVarUhShort();
        if (this.outcome < 0) {
            Logger.error("Forbidden value (" + this.outcome + ") on element of NamedPartyTeamWithOutcome.outcome.");
        }
    }
}

export class NamedPartyTeam {
    constructor(teamId, partyName) {
        this.teamId = teamId;
        this.partyName = partyName;
        this.protocolId = 469;
    }
    serialize(buffer) {
        buffer.writeByte(this.teamId);
        buffer.writeUTF(this.partyName);
    }
    deserialize(buffer) {
        this.teamId = buffer.readByte();
        if (this.teamId < 0) {
            Logger.error("Forbidden value (" + this.teamId + ") on element of NamedPartyTeam.teamId.");
        }
        this.partyName = buffer.readUTF();
    }
}

export class FightResultListEntry {
    constructor(outcome, wave, rewards) {
        this.outcome = outcome;
        this.wave = wave;
        this.rewards = rewards;
        this.protocolId = 16;
    }
    serialize(buffer) {
        buffer.writeVarShort(this.outcome);
        if (this.wave < 0) {
            Logger.error("Forbidden value (" + this.wave + ") on element wave.");
        }
        buffer.writeByte(this.wave);
        this.rewards.serialize(buffer);
    }
    deserialize(buffer) {
        this.outcome = buffer.readVarUhShort();
        if (this.outcome < 0) {
            Logger.error("Forbidden value (" + this.outcome + ") on element of FightResultListEntry.outcome.");
        }
        this.wave = buffer.readByte();
        if (this.wave < 0) {
            Logger.error("Forbidden value (" + this.wave + ") on element of FightResultListEntry.wave.");
        }
        this.rewards = new Types.FightLoot();
        this.rewards.deserialize(buffer);
    }
}

export class FightResultFighterListEntry extends FightResultListEntry {
    constructor(param1, param2, param3, id, alive) {
        super(param1, param2, param3);
        this.id = id;
        this.alive = alive;
        this.protocolId = 189;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        buffer.writeDouble(this.id);
        buffer.writeBoolean(this.alive);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of FightResultFighterListEntry.id.");
        }
        this.alive = buffer.readBoolean();
    }
}

export class FightResultMutantListEntry extends FightResultFighterListEntry {
    constructor(param1, param2, param3, param4, param5, level) {
        super(param1, param2, param3, param4, param5);
        this.level = level;
        this.protocolId = 216;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.level < 0) {
            Logger.error("Forbidden value (" + this.level + ") on element level.");
        }
        buffer.writeVarShort(this.level);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.level = buffer.readVarUhShort();
        if (this.level < 0) {
            Logger.error("Forbidden value (" + this.level + ") on element of FightResultMutantListEntry.level.");
        }
    }
}

export class FightLoot {
    constructor(objects, kamas) {
        this.objects = objects;
        this.kamas = kamas;
        this.protocolId = 41;
    }
    serialize(buffer) {
        buffer.writeShort(this.objects.length);
        var _loc2_ = 0;
        while (_loc2_ < this.objects.length) {
            if (this.objects[_loc2_] < 0) {
                Logger.error("Forbidden value (" + this.objects[_loc2_] + ") on element 1 (starting at 1) of objects.");
            }
            buffer.writeVarShort(this.objects[_loc2_]);
            _loc2_++;
        }
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element kamas.");
        }
        buffer.writeVarInt(this.kamas);
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readVarUhShort();
            if (_loc4_ < 0) {
                Logger.error("Forbidden value (" + _loc4_ + ") on elements of objects.");
            }
            this.objects.push(_loc4_);
            _loc3_++;
        }
        this.kamas = buffer.readVarUhInt();
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element of FightLoot.kamas.");
        }
    }
}

export class MapCoordinates {
    constructor(worldX, worldY) {
        this.worldX = worldX;
        this.worldY = worldY;
        this.protocolId = 174;
    }
    serialize(buffer) {
        if (this.worldX < -255 || this.worldX > 255) {
            Logger.error("Forbidden value (" + this.worldX + ") on element worldX.");
        }
        buffer.writeShort(this.worldX);
        if (this.worldY < -255 || this.worldY > 255) {
            Logger.error("Forbidden value (" + this.worldY + ") on element worldY.");
        }
        buffer.writeShort(this.worldY);
    }
    deserialize(buffer) {
        this.worldX = buffer.readShort();
        if (this.worldX < -255 || this.worldX > 255) {
            Logger.error("Forbidden value (" + this.worldX + ") on element of MapCoordinates.worldX.");
        }
        this.worldY = buffer.readShort();
        if (this.worldY < -255 || this.worldY > 255) {
            Logger.error("Forbidden value (" + this.worldY + ") on element of MapCoordinates.worldY.");
        }
    }
}

export class PartyInvitationMemberInformations extends CharacterBaseInformations {
    constructor(param1, param2, param3, param4, param5, param6, worldX, worldY, mapId, subAreaId, companions) {
        super(param1, param2, param3, param4, param5, param6);
        this.worldX = worldX;
        this.worldY = worldY;
        this.mapId = mapId;
        this.subAreaId = subAreaId;
        this.companions = companions;
        this.protocolId = 376;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.worldX < -255 || this.worldX > 255) {
            Logger.error("Forbidden value (" + this.worldX + ") on element worldX.");
        }
        buffer.writeShort(this.worldX);
        if (this.worldY < -255 || this.worldY > 255) {
            Logger.error("Forbidden value (" + this.worldY + ") on element worldY.");
        }
        buffer.writeShort(this.worldY);
        buffer.writeInt(this.mapId);
        if (this.subAreaId < 0) {
            Logger.error("Forbidden value (" + this.subAreaId + ") on element subAreaId.");
        }
        buffer.writeVarShort(this.subAreaId);
        buffer.writeShort(this.companions.length);
        var _loc2_ = 0;
        while (_loc2_ < this.companions.length) {
            this.companions[_loc2_].serialize(buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        super.deserialize(buffer);
        this.worldX = buffer.readShort();
        if (this.worldX < -255 || this.worldX > 255) {
            Logger.error("Forbidden value (" + this.worldX + ") on element of PartyInvitationMemberInformations.worldX.");
        }
        this.worldY = buffer.readShort();
        if (this.worldY < -255 || this.worldY > 255) {
            Logger.error("Forbidden value (" + this.worldY + ") on element of PartyInvitationMemberInformations.worldY.");
        }
        this.mapId = buffer.readInt();
        this.subAreaId = buffer.readVarUhShort();
        if (this.subAreaId < 0) {
            Logger.error("Forbidden value (" + this.subAreaId + ") on element of PartyInvitationMemberInformations.subAreaId.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new PartyCompanionBaseInformations();
            _loc4_.deserialize(buffer);
            this.companions.push(_loc4_);
            _loc3_++;
        }
    }
}

export class Shortcut {
    constructor(slot) {
        this.slot = slot;
        this.protocolId = 369;
    }
    serialize(buffer) {
        if (this.slot < 0 || this.slot > 99) {
            Logger.error("Forbidden value (" + this.slot + ") on element slot.");
        }
        buffer.writeByte(this.slot);
    }
    deserialize(buffer) {
        this.slot = buffer.readByte();
        if (this.slot < 0 || this.slot > 99) {
            Logger.error("Forbidden value (" + this.slot + ") on element of Shortcut.slot.");
        }
    }
}

export class ShortcutEmote extends Shortcut {
    constructor(param1, emoteId) {
        super(param1);
        this.emoteId = emoteId;
        this.protocolId = 389;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        buffer.writeByte(this.emoteId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of ShortcutEmote.emoteId.");
        }
    }
}

export class ShortcutObject extends Shortcut {
    constructor(param1) {
        super(param1);
        this.protocolId = 367;
    }
    serialize(buffer) {
        super.serialize(buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class ShortcutObjectIdolsPreset extends ShortcutObject {
    constructor(param1, presetId) {
        super(param1);
        this.presetId = presetId;
        this.protocolId = 492;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.presetId < 0) {
            Logger.error("Forbidden value (" + this.presetId + ") on element presetId.");
        }
        buffer.writeByte(this.presetId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.presetId = buffer.readByte();
        if (this.presetId < 0) {
            Logger.error("Forbidden value (" + this.presetId + ") on element of ShortcutObjectIdolsPreset.presetId.");
        }
    }
}

export class ShortcutObjectItem extends ShortcutObject {
    constructor(param1, itemUID, itemGID) {
        super(param1);
        this.itemUID = itemUID;
        this.itemGID = itemGID;
        this.protocolId = 371;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeInt(this.itemUID);
        buffer.writeInt(this.itemGID);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.itemUID = buffer.readInt();
        this.itemGID = buffer.readInt();
    }
}

export class ShortcutObjectPreset extends ShortcutObject {
    constructor(param1, presetId) {
        super(param1);
        this.presetId = presetId;
        this.protocolId = 370;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.presetId < 0) {
            Logger.error("Forbidden value (" + this.presetId + ") on element presetId.");
        }
        buffer.writeByte(this.presetId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.presetId = buffer.readByte();
        if (this.presetId < 0) {
            Logger.error("Forbidden value (" + this.presetId + ") on element of ShortcutObjectPreset.presetId.");
        }
    }
}

export class ShortcutSmiley extends Shortcut {
    constructor(param1, smileyId) {
        super(param1);
        this.smileyId = smileyId;
        this.protocolId = 388;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.smileyId < 0) {
            Logger.error("Forbidden value (" + this.smileyId + ") on element smileyId.");
        }
        buffer.writeVarShort(this.smileyId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.smileyId = buffer.readVarUhShort();
        if (this.smileyId < 0) {
            Logger.error("Forbidden value (" + this.smileyId + ") on element of ShortcutSmiley.smileyId.");
        }
    }
}

export class ShortcutSpell extends Shortcut {
    constructor(param1, spellId) {
        super(param1);
        this.spellId = spellId;
        this.protocolId = 368;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        buffer.writeVarShort(this.spellId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of ShortcutSpell.spellId.");
        }
    }
}
export class GameRolePlayNpcInformations extends GameRolePlayActorInformations {
    constructor(param1, param2, param3, npcId, sex, specialArtworkId) {
        super(param1, param2, param3);
        this.npcId = npcId;
        this.sex = sex;
        this.specialArtworkId = specialArtworkId;
        this.protocolId = 156;
    }
    serialize(buffer) {
        super.serialize(buffer);
        if (this.npcId < 0) {
            Logger.error("Forbidden value (" + this.npcId + ") on element npcId.");
        }
        buffer.writeVarShort(this.npcId);
        buffer.writeBoolean(this.sex);
        if (this.specialArtworkId < 0) {
            Logger.error("Forbidden value (" + this.specialArtworkId + ") on element specialArtworkId.");
        }
        buffer.writeVarShort(this.specialArtworkId);
    }
}

export class AbstractFightDispellableEffect {
    constructor(uid, targetId, turnDuration, dispelable, spellId, effectId, parentBoostUid) {
        this.uid = uid;
        this.targetId = targetId;
        this.turnDuration = turnDuration;
        this.dispelable = dispelable;
        this.spellId = spellId;
        this.effectId = effectId;
        this.parentBoostUid = parentBoostUid;
        this.protocolId = 206;
    }

    serialize(buffer) {
        if (this.uid < 0) {
            Logger.error("Forbidden value (" + this.uid + ") on element uid.");
        }
        buffer.writeVarInt(this.uid);
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        buffer.writeDouble(this.targetId);
        buffer.writeShort(this.turnDuration);
        buffer.writeByte(this.dispelable);
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        buffer.writeVarShort(this.spellId);
        if (this.effectId < 0) {
            Logger.error("Forbidden value (" + this.effectId + ") on element effectId.");
        }
        buffer.writeVarInt(this.effectId);
        if (this.parentBoostUid < 0) {
            Logger.error("Forbidden value (" + this.parentBoostUid + ") on element parentBoostUid.");
        }
        buffer.writeVarInt(this.parentBoostUid);
    }
    deserialize(buffer) {
        this.uid = buffer.readVarUhInt();
        if (this.uid < 0) {
            Logger.error("Forbidden value (" + this.uid + ") on element of AbstractFightDispellableEffect.uid.");
        }
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of AbstractFightDispellableEffect.targetId.");
        }
        this.turnDuration = buffer.readShort();
        this.dispelable = buffer.readByte();
        if (this.dispelable < 0) {
            Logger.error("Forbidden value (" + this.dispelable + ") on element of AbstractFightDispellableEffect.dispelable.");
        }
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of AbstractFightDispellableEffect.spellId.");
        }
        this.effectId = buffer.readVarUhInt();
        if (this.effectId < 0) {
            Logger.error("Forbidden value (" + this.effectId + ") on element of AbstractFightDispellableEffect.effectId.");
        }
        this.parentBoostUid = buffer.readVarUhInt();
        if (this.parentBoostUid < 0) {
            Logger.error("Forbidden value (" + this.parentBoostUid + ") on element of AbstractFightDispellableEffect.parentBoostUid.");
        }
    }
}

export class FightTemporaryBoostEffect extends AbstractFightDispellableEffect {
    constructor(param1, param2, param3, param4, param5, param6, param7, delta) {
        super(param1, param2, param3, param4, param5, param6, param7);
        this.delta = delta;
        this.protocolId = 209;
    }
    serialize(buffer) {
        super.serialize(buffer);
        buffer.writeShort(this.delta);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.delta = buffer.readShort();
    }
}