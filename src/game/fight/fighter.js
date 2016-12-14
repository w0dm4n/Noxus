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

export default class Fighter {

    constructor(character, fight) {
        this.character = character;
        this.fight = fight;
        this.character.fighter = this;
        this.character.fight = this.fight;
        this.team = null;
        this.ready = false;
        this.cellId = -1;
        this.dirId = 3;
        this.alive = true;
        this.sequenceCount = 0;
        CharacterManager.applyRegen(this.character);
        this.current = {
            life: this.character.life,
            shieldPoint: 0,
            AP: this.character.statsManager.getTotalStats(1),
            MP: this.character.statsManager.getTotalStats(2)
        }
        this.generateFighterStatsBonus();
        this.buffs = [];
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
    }

    get id() {
        return this.character._id;
    }

    get level() {
        return this.character.level;
    }

    send(packet) {
        this.character.client.send(packet);
    }

    getStats() {
        return this.character.statsManager;
    }

    refreshStats() {
        this.getStats().sendFightStats();
    }

    resetPoints() {
        this.current.AP = this.character.statsManager.getTotalStats(1);
        this.current.MP = this.character.statsManager.getTotalStats(2);
    }

    createContext() {
        this.send(new Messages.GameContextDestroyMessage());
        this.send(new Messages.GameContextCreateMessage(2));
    }

    restoreRoleplayContext() {
        this.send(new Messages.GameContextDestroyMessage());
        this.send(new Messages.GameContextCreateMessage(1));
        this.character.statsManager.sendStats();
        WorldManager.teleportClient(this.character.client, this.character.mapid, this.character.cellid, function(result){
            if (!result)
            {
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
        if(this.fight.fightState == Fight.FIGHT_STATES.STARTING) {
            this.ready = state;
            this.fight.send(new Messages.GameFightHumanReadyStateMessage(this.character._id, this.ready));
            this.fight.checkStartupPhaseReady();
        }
    }

    getFightTeamMemberCharacterInformations() {
        return new Types.FightTeamMemberCharacterInformations(this.character._id, this.character.name, this.character.level);
    }

    passTurn() {
        if(this.fight.timeline.currentFighter()) {
            if(this.isMyTurn()) {
                this.fight.timeline.next();
            }
        }
    }

    isMyTurn() {
        return this.fight.timeline.currentFighter().character._id == this.character._id;
    }

    beginTurn() {
        //TODO
    }

    checkBuffs() {
        this.fight.send(new Messages.SequenceStartMessage(0, this.id));
        var newBuffs = [];
        for(var buff of this.buffs) {
            buff.continueLifetime();
            if(!buff.expired) {
                newBuffs.push(buff);
            }
        }
        this.fight.send(new Messages.SequenceEndMessage(1, this.id, 0));
        this.buffs = newBuffs;
    }

    addBuff(buff) {
        Logger.debug("Add buff id: " + buff.effectId + " on fighter id: " + this.id);
        this.buffs.push(buff);
        buff.tryApply();
        if(buff instanceof AddStateBuff) {
            Logger.debug("The buff is a state buff (id: " + buff.delta + "), so the fighter has now " + this.getStates().length + " state(s)");
        }
    }

    getStates() {
        var states = [];
        for(var buff of this.buffs) {
            if(buff instanceof AddStateBuff) {
                states.push(buff);
            }
        }
        return states;
    }

    hasState(stateId) {
        var states = this.getStates();
        for(var buff of states) {
            if(buff.delta == stateId) return true;
        }
        return false;
    }

    takeDamage(from, damages, elementType) {
        //TODO: Apply damage reduction and invu
        //TODO: Check shield point because the packet is not the same
        //TODO: Erosion system
        if(this.alive) {
            if(this.current.life - damages < 0) {
                damages = this.current.life;
            }
            this.current.life -= damages;
            this.fight.send(new Messages.GameActionFightLifePointsLostMessage(0, from.id, this.id, damages, 0));
            this.checkIfIsDead();
            return damages;
        }
        else {
            return 0;
        }
    }

    heal(from, heal, elementType) {
        if(this.current.life + heal > this.getStats().getMaxLife()) {
            heal = this.getStats().getMaxLife() - this.current.life;
        }
        this.current.life += heal;
        if(heal > 0) this.fight.send(new Messages.GameActionFightLifePointsGainMessage(0, from.id, this.id, heal));
    }

    checkCalcRate(calc)
    {
        if (calc == 0 || calc < 10)
            return 10;
        if (calc > 100 && calc <= 150)
             return 60;
        else if (calc > 100 && calc <= 160)
            return 65;
        else if (calc > 180)
            return 70;
        return calc;
    }


    looseAP(data, apPoints)
    {
        if (this.alive)
        {
            var baseLostAp = apPoints;
            if (apPoints > 0) {
                var totalAPLost = 0;
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
                if (totalAPLost < baseLostAp)
                {
                    this.fight.send(new Messages.GameActionFightDodgePointLossMessage(308, data.caster.id, this.id, (baseLostAp - totalAPLost)));
                }
            }
        }

    }

    looseMP(data, mpPoints)
    {
        if (this.alive) {
            var baseLostMP = mpPoints;
            var totalMPLost = 0;
            var calc = 0;
            var rand = 0;
            var caster_retrait = data.caster.getStats().getDodgeAndWithdrawal();
            var target_esquive = this.getStats().getDodgeAndWithdrawal();
            Logger.infos("Caster retrait: " + caster_retrait + ", Target esquive: " + target_esquive);
            while (mpPoints > 0) {
                if (this.current.MP > 0) {
                    calc = Math.floor((50 * (caster_retrait / target_esquive) * (this.current.MP / this.getStats().getTotalStats(2))));
                    calc = this.checkCalcRate(calc);
                    if (calc > 0) {
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
                }
                mpPoints--;
            }
            if (totalMPLost != 0)
                this.addBuff(new RemoveMPBuff(totalMPLost, data.spell, data.spellLevel, data.effect, data.caster, this));
            if (totalMPLost < baseLostMP)
            {
                this.fight.send(new Messages.GameActionFightDodgePointLossMessage(309, data.caster.id, this.id, (baseLostMP - totalMPLost)));
            }
        }
    }

    checkIfIsDead() {
        if(this.current.life <= 0) {
            this.alive = false;
        }

        if(!this.alive) {
            this.enableDeadState();
        }
    }

    enableDeadState() {
        this.alive = false;
        this.fight.send(new Messages.GameActionFightDeathMessage(103, this.id, this.id))

        if(this.isMyTurn()) {
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
        var path = [];
        for(var i = 0; i < power; i++) {
            var dirCell = point.getNearestCellInDirection(dir);
            if(dirCell) {
                if(this.fight.getFighterOnCell(dirCell._nCellId)) {
                    collidedFighter = this.fight.getFighterOnCell(dirCell._nCellId);
                    break;
                }

                if(!this.fight.map.isWalkableCell(dirCell._nCellId)) {
                    break;
                }
                point = dirCell;
                toCell = dirCell._nCellId;
            }
            else {
                break;
            }
        }
        this.fight.send(new Messages.GameActionFightSlideMessage(0, this.id, this.id, this.cellId, toCell));
        this.cellId = toCell;
    }
}