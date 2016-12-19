import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Logger from "../../io/logger"
import Fight from "./fight"
import CharacterManager from "../../managers/character_manager"
import WorldManager from "../../managers/world_manager"
import MapPoint from "../pathfinding/map_point"
import RemoveAPBuff from "../../game/spell/buffs/remove_ap_buff"
import RemoveMPBuff from "../../game/spell/buffs/remove_mp_buff"
import Basic from "../../utils/basic"
import AddStateBuff from "../spell/buffs/add_state_buff"
import * as Shapes from "../../game/fight/fight_shape_processor"
import MonsterStatsManager from "../../game/stats/monster_stats_manager"
import InvisibilityStateEnum from "../../enums/invisibility_state_enum"
import SpellHistory from "../../game/spell/spell_history"

export default class Fighter {


    static FIGHTER_TYPE = {
        HUMAN: 1,
        MONSTER: 2,
    };


    constructor(fight) {
        this.fight = fight;
        this.team = null;
        this.ready = false;
        this.cellId = -1;
        this.dirId = 3;
        this.alive = true;
        this.sequenceCount = 0;
        this.generateFighterStatsBonus();
        this.buffs = [];
        this.spellDamagesBoosts = {};
        this.fighterType = Fighter.FIGHTER_TYPE.HUMAN;
        this.spellHistory = new SpellHistory(this);
        this.isSwapDamage = 0;
        this.multipleDamage = 0;
    }

    initFromCharacter(character) {
        this.character = character;
        this.character.fighter = this;
        this.character.fight = this.fight;
        CharacterManager.applyRegen(this.character);
        this.current = {
            life: this.character.life,
            shieldPoint: 0,
            AP: this.getStats().getTotalStats(1),
            MP: this.getStats().getTotalStats(2),
            erosion: 0,
        };
        this.fighterType = Fighter.FIGHTER_TYPE.HUMAN;
        return this;
    }

    initFromMonster(monster) {
        this.monster = monster;
        this.monsterStatsManager = new MonsterStatsManager(this);
        this.fighterType = Fighter.FIGHTER_TYPE.MONSTER;
        this.current = {
            life: this.getStats().getMaxLife(),
            shieldPoint: 0,
            AP: this.getStats().getTotalStats(1),
            MP: this.getStats().getTotalStats(2),
            erosion: 0,
        };
        return this;
    }

    generateFighterStatsBonus() {
        this.fightStatsBonus = [];
        this.fightStatsBonus[1] = 0;
        this.fightStatsBonus[2] = 0;
        this.fightStatsBonus[10] = 0;
        this.fightStatsBonus[11] = 0;
        this.fightStatsBonus[12] = 0;
        this.fightStatsBonus[13] = 0;
        this.fightStatsBonus[14] = 0;
        this.fightStatsBonus[15] = 0;
        this.fightStatsBonus[16] = 0;
        this.fightStatsBonus[17] = 0;
        this.fightStatsBonus[18] = 0;
        this.fightStatsBonus[19] = 0;
        this.fightStatsBonus[20] = 0;
        this.fightStatsBonus[21] = 0;
    }

    get id() {
        return this.character._id;
    }

    get level() {
        return this.character.level;
    }

    get isAI() {
        return false;
    }

    send(packet) {
        if (!this.isAI)
            this.character.client.send(packet);
    }

    getStats() {
        if (this.fighterType == Fighter.FIGHTER_TYPE.MONSTER) {
            return this.monsterStatsManager;
        }
        else {
            return this.character.statsManager;
        }
    }

    refreshStats() {
        this.getStats().sendFightStats();
    }

    resetPoints() {
        this.current.AP = this.getStats().getTotalStats(1);
        this.current.MP = this.getStats().getTotalStats(2);
    }

    createContext() {
        this.send(new Messages.GameContextDestroyMessage());
        this.send(new Messages.GameContextCreateMessage(2));
    }

    restoreRoleplayContext() {
        this.send(new Messages.GameContextDestroyMessage());
        this.send(new Messages.GameContextCreateMessage(1));
        this.character.statsManager.sendStats();
        WorldManager.teleportClient(this.character.client, this.character.mapid, this.character.cellid, function (result) {
            if (!result) {
                Logger.error("An error occured while trying to load a map for the character " + this.character.name);
                this.character.client.disconnect();
            }
        });
    }

    getGameFightMinimalStatsPreparation() {
        return new Types.GameFightMinimalStatsPreparation(this.current.life, this.getStats().getMaxLife(), this.getStats().getMaxLife(), this.getStats().getTotalStats(17), 0,
            this.current.AP, this.getStats().getTotalStats(1),
            this.current.MP, this.getStats().getTotalStats(2), 0, false, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000);
    }

    getGameFightFighterInformations() {
        return new Types.GameFightCharacterInformations(this.id, this.character.getEntityLook(),
            new Types.EntityDispositionInformations(this.cellId, this.dirId), this.team.id, 0, this.alive, this.getGameFightMinimalStatsPreparation(), [],
            this.character.name, new Types.PlayerStatus(1), this.character.level, new Types.ActorAlignmentInformations(0, 0, 0, 0), this.character.breed, this.character.sex);
    }

    setReadyState(state) {
        if (this.fight.fightState == Fight.FIGHT_STATES.STARTING) {
            this.ready = state;
            this.fight.send(new Messages.GameFightHumanReadyStateMessage(this.id, this.ready));
            this.fight.checkStartupPhaseReady();
        }
    }

    getFightTeamMemberCharacterInformations() {
        return new Types.FightTeamMemberCharacterInformations(this.id, this.character.name, this.character.level);
    }

    passTurn() {
        if (this.fight.timeline.currentFighter()) {
            if (this.isMyTurn()) {
                if (this.fight.fightState == Fight.FIGHT_STATES.FIGHTING) {
                    this.fight.timeline.next();
                }
            }
        }
    }

    isMyTurn() {
        return this.fight.timeline.currentFighter().id == this.id;
    }

    beginTurn() {
        //TODO: Apply glyph
    }

    endTurn() {
        this.fight.send(new Messages.SequenceStartMessage(0, this.id));
        var newBuffs = [];
        for (var buff of this.buffs) {
            buff.checkExpires();
            if (!buff.expired) {
                newBuffs.push(buff);
            }
        }
        this.fight.send(new Messages.SequenceEndMessage(1, this.id, 0));
        this.buffs = newBuffs;
    }

    checkBuffs() {
        this.fight.send(new Messages.SequenceStartMessage(0, this.id));
        for (var buff of this.buffs) {
            buff.continueLifetime();
        }
        this.fight.send(new Messages.SequenceEndMessage(1, this.id, 0));
    }

    getActiveBuffByEffectId(effectId, spellId) {
        var i = 0;
        for (var buff of this.buffs) {
            if (buff.effectId == effectId && buff.spellLevel._id == spellId) {
                if (!buff.isExpired())
                    i++;
            }
        }
        return i;
    }

    checkBuffValidity(spellLevel, effectId, spellLevelId) {
        var maxStack = spellLevel.maxStack;
        if (effectId == 950)
            return true;
        if (maxStack > 0) {
            var stack = this.getActiveBuffByEffectId(effectId, spellLevelId);
            return (stack < maxStack) ? true : false;
        }
        else
            return true;
    }

    addBuff(buff) {
        if (this.checkBuffValidity(buff.spellLevel, buff.effectId, buff.spellLevel._id)) {
            Logger.debug("Add buff id: " + buff.effectId + " on fighter id: " + this.id);
            this.buffs.push(buff);
            buff.tryApply();
            if (buff instanceof AddStateBuff) {
                Logger.debug("The buff is a state buff (id: " + buff.delta + "), so the fighter has now " + this.getStates().length + " state(s)");
            }
            this.refreshStats();
        }
        else
            Logger.debug("Trying to apply buff id:" + buff.effectId + " but max stack reached !");
    }

    getStates() {
        var states = [];
        for (var buff of this.buffs) {
            if (buff instanceof AddStateBuff) {
                states.push(buff);
            }
        }
        return states;
    }

    hasState(stateId) {
        var states = this.getStates();
        for (var buff of states) {
            if (buff.delta == stateId) return true;
        }
        return false;
    }

    getErodationByDamage(damage) {
        //TODO: Get erosion by buffs
        return Basic.getPercentage(10, damage);
    }

    getDamage(data, elementType, isWeapon = false) {
        var power = data.caster.getStats().getTotalStats(elementType);
        var roll = Basic.getRandomInt(data.effect.diceNum, data.effect.diceSide);
        var spellPowerBoost = data.caster.spellDamagesBoosts[data.spell.spellId] ? data.caster.spellDamagesBoosts[data.spell.spellId] : 0;
        if (!isWeapon)
            power += data.caster.getStats().getTotalStats(20);
        var dmg = (Math.floor(((roll + spellPowerBoost) * (100 + power + data.caster.getStats().getTotalStats(17)) / 100)) + data.caster.getStats().getTotalStats(18));
        return dmg < 0 ? data.effect.diceNum : dmg;
    }

    takeDamage(from, damages, elementType) {
        //TODO: Apply damage reduction and invu
        //TODO: Check shield point because the packet is not the same
        //TODO: Erosion system
        if (this.alive) {
            if (this.isSwapDamage == 1) {
                this.heal(from, damages, 0);
            } else {
                if(this.multipleDamage > 0){
                    damages *= (this.multipleDamage / 100);
                }
                if (this.current.life - damages < 0) {
                    damages = this.current.life;
                }
                this.current.life -= damages;
                var erodedLife = this.getErodationByDamage(damages);
                this.current.erosion += erodedLife;
                Logger.debug("Fighter taking damages amount: " + damages + " and get erosion amount: " + erodedLife);
                this.fight.send(new Messages.GameActionFightLifePointsLostMessage(0, from.id, this.id, damages, erodedLife));
                this.checkIfIsDead();
                return damages;
            }

        }
        else {
            return 0;
        }
    }

    heal(from, heal, elementType) {
        if (this.current.life + heal > this.getStats().getMaxLife()) {
            heal = this.getStats().getMaxLife() - this.current.life;
        }
        this.current.life += heal;
        if (heal > 0) this.fight.send(new Messages.GameActionFightLifePointsGainMessage(0, from.id, this.id, heal));
    }

    checkCalcRate(calc) {
        if (calc < 0 || calc < 20)
            return 20;
        if (calc > 100 && calc <= 150)
            return 60;
        else if (calc > 100 && calc <= 160)
            return 65;
        else if (calc > 180)
            return 70;
        return calc;
    }


    looseAP(data, apPoints) {
        var totalAPLost = 0;
        if (this.alive) {
            var baseLostAp = apPoints;
            if (apPoints > 0) {
                var calc = 0;
                var rand = 0;
                var caster_retrait = data.caster.getStats().getDodgeAndWithdrawal();
                var target_esquive = this.getStats().getDodgeAndWithdrawal();
                Logger.infos("Caster retrait: " + caster_retrait + ", Target esquive: " + target_esquive);
                while (apPoints > 0) {
                    if (this.current.AP > 0) {
                        calc = Math.floor((50 * (caster_retrait / target_esquive) * (this.current.AP / this.getStats().getTotalStats(1))));
                        calc = this.checkCalcRate(calc);
                        if (calc > 0) {
                            rand = Basic.getRandomInt(0, 100);
                            if (calc >= rand) {
                                Logger.debug("One PA lose with calc : " + calc + ", rand : " + rand);
                                this.current.AP -= 1;
                                totalAPLost++;
                            }
                            else {
                                Logger.debug("One PA lose avoid with calc : " + calc + ", rand : " + rand);
                            }
                        }
                    }
                    apPoints--;
                }
                if (totalAPLost != 0)
                    this.addBuff(new RemoveAPBuff(totalAPLost, data.spell, data.spellLevel, data.effect, data.caster, this));
                if (totalAPLost < baseLostAp) {
                    this.fight.send(new Messages.GameActionFightDodgePointLossMessage(308, data.caster.id, this.id, (baseLostAp - totalAPLost)));
                }
            }
        }
        return totalAPLost;
    }

    looseMP(data, mpPoints) {
        var totalMPLost = 0;
        if (this.alive) {
            var baseLostMP = mpPoints;
            var calc = 0;
            var rand = 0;
            var caster_retrait = data.caster.getStats().getDodgeAndWithdrawal();
            var target_esquive = this.getStats().getDodgeAndWithdrawal();
            Logger.infos("Caster retrait: " + caster_retrait + ", Target esquive: " + target_esquive);
            while (mpPoints > 0) {
                Logger.debug("fdp1");
                if (this.current.MP > 0) {
                    Logger.debug("fdp2");
                    calc = Math.floor((50 * (caster_retrait / target_esquive) * (this.current.MP / this.getStats().getTotalStats(2))));
                    calc = this.checkCalcRate(calc);
                    if (calc > 0) {
                        Logger.debug("fdp3");
                        rand = Basic.getRandomInt(0, 100);
                        if (calc >= rand) {
                            Logger.debug("One PM lose with calc : " + calc + ", rand : " + rand);
                            this.current.MP -= 1;
                            totalMPLost++;
                        }
                        else {
                            Logger.debug("One PM lose avoid with calc : " + calc + ", rand : " + rand);
                        }
                    }
                    else
                        Logger.debug("fdp4");
                }
                else
                    Logger.debug("NO PM !");
                mpPoints--;
            }
            if (totalMPLost != 0)
                this.addBuff(new RemoveMPBuff(totalMPLost, data.spell, data.spellLevel, data.effect, data.caster, this));
            if (totalMPLost < baseLostMP) {
                this.fight.send(new Messages.GameActionFightDodgePointLossMessage(309, data.caster.id, this.id, (baseLostMP - totalMPLost)));
            }
        }
        return totalMPLost;
    }

    checkIfIsDead() {
        if (this.current.life <= 0) {
            this.alive = false;
        }

        if (!this.alive) {
            this.enableDeadState();
        }
    }

    enableDeadState() {
        this.alive = false;
        this.fight.send(new Messages.GameActionFightDeathMessage(103, this.id, this.id))

        if (this.isMyTurn()) {
            this.fight.timeline.next();
        }

        this.fight.checkEnd();
    }

    teleport(cellId) {
        this.cellId = cellId;
        this.fight.send(new Messages.GameActionFightTeleportOnSameMapMessage(5, this.id, this.id, this.cellId));
    }

    push(dir, power) {
        var point = MapPoint.fromCellId(this.cellId);
        var toCell = this.cellId;
        var collidedFighter = null;
        var cells = [];
        for (var i = 0; i < power; i++) {
            var dirCell = point.getNearestCellInDirection(dir);
            if (dirCell) {
                if (this.fight.getFighterOnCell(dirCell._nCellId)) {
                    collidedFighter = this.fight.getFighterOnCell(dirCell._nCellId);
                    break;
                }

                if (!this.fight.map.isWalkableCell(dirCell._nCellId)) {
                    break;
                }

                var glyphsOnCell = this.fight.getGlyphsOnCell(dirCell._nCellId);
                if (glyphsOnCell.length > 0) {
                    for (var glyph of glyphsOnCell) {
                        glyph.apply(this);
                    }
                    point = dirCell;
                    toCell = dirCell._nCellId;
                    break;
                }

                point = dirCell;
                toCell = dirCell._nCellId;
                cells.push(dirCell);
            }
            else {
                break;
            }
        }
        if (this.isInvisible()) {
            this.team.send(new Messages.GameActionFightSlideMessage(0, this.id, this.id, this.cellId, toCell));
        }
        else {
            this.fight.send(new Messages.GameActionFightSlideMessage(0, this.id, this.id, this.cellId, toCell));
        }
        this.cellId = toCell;
    }

    attract(dir, data, radius) {
        var line = new Shapes.Line(radius);
        line._nDirection = dir;
        var cells = line.getCells(data.caster.cellId);
        var toCell = this.cellId;
        var i = 0;
        var distance = 0;
        for (var cell of cells) {
            if (cell == this.cellId)
                break;
            i++;
        }
        i--;
        while (i > 0 && distance < data.effect.diceNum) {
            if (this.fight.getFighterOnCell(cells[i]))
                break;
            if (!this.fight.map.isWalkableCell(cells[i]))
                break;
            toCell = cells[i];
            i--;
            distance++;
        }
        if (this.isInvisible()) {
            this.team.send(new Messages.GameActionFightSlideMessage(0, this.id, this.id, this.cellId, toCell));
        }
        else {
            this.fight.send(new Messages.GameActionFightSlideMessage(0, this.id, this.id, this.cellId, toCell));
        }
        this.cellId = toCell;
    }

    isInvisible() {
        return (this.invisibilityState == InvisibilityStateEnum.INVISIBLE) ? true : false;
    }

    updateInvisibility(effectId) {
        var oppositeTeam = this.fight.getOppositeTeam(this.team);
        switch (this.invisibilityState) {
            case InvisibilityStateEnum.INVISIBLE:
                this.team.send(new Messages.GameActionFightInvisibilityMessage(150, effectId, this.id, InvisibilityStateEnum.DETECTED));
                oppositeTeam.send(new Messages.GameActionFightInvisibilityMessage(150, effectId, this.id, InvisibilityStateEnum.INVISIBLE));
                break;

            case InvisibilityStateEnum.DETECTED:
                break;

            case InvisibilityStateEnum.VISIBLE:
                this.fight.send(new Messages.GameActionFightInvisibilityMessage(150, effectId, this.id, InvisibilityStateEnum.VISIBLE));
                break;
        }
    }

    canCastSpell(spell, cell) {
        var result;
        if (this.alive) {
            if (!this.character.statsManager.hasSpell(spell.spellId)) {
                result = false;
            } else {

                if (!this.spellHistory.canCastSpell(spell, cell)) {
                    result = false;
                } else {
                    result = true;
                }

            }

        } else {
            result = false;
        }
        return result;

    }
}