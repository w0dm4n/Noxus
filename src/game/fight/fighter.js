import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Logger from "../../io/logger"
import Fight from "./fight"
import CharacterManager from "../../managers/character_manager"
import WorldManager from "../../managers/world_manager"
import MapPoint from "../pathfinding/map_point"
import RemoveAPBuff from "../../game/spell/buffs/remove_ap_buff"

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
        this.fightStatsBonus[18] = 8;
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
        this.getStats().sendStats();
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
                client.character.disconnect();
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
        var newBuffs = [];
        for(var buff of this.buffs) {
            buff.continueLifetime();
            if(!buff.expired) {
                newBuffs.push(buff);
            }
        }

        this.buffs = newBuffs;
    }

    addBuff(buff) {
        Logger.debug("Add buff id: " + buff.effectId + " on fighter id: " + this.id);
        this.buffs.push(buff);
        buff.tryApply();
    }

    takeDamage(from, damages, elementType) {
        //TODO: Apply damage reduction and invu
        //TODO: Check shield point because the packet is not the same
        //TODO: Erosion system
        if(this.alive) {
            this.current.life -= damages;
            this.fight.send(new Messages.GameActionFightLifePointsLostMessage(0, from.id, this.id, damages, 0));
            this.checkIfIsDead();
        }
    }

    looseAP(data, apPoints)
    {
        if (this.alive)
        {

            /*var calc = Math.floor((apPoints * this.getStats().getTotalStats(12)) / 100);
            if (calc <= 0)
            {
                this.fight.send(new Messages.GameActionFightDodgePointLossMessage(308, caster.id, this.id, calc));
            }
            else {

            }*/
            this.addBuff(new RemoveAPBuff(apPoints, data.spell, data.spellLevel, data.effect, data.caster, this));
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
                if(this.fight.getFighterOnCell(dirCell)) {
                    collidedFighter = this.fight.getFighterOnCell(dirCell);
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