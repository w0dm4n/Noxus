import Fighter from "./fighter"
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
import BasicAI from "../monsters/ai/basic_ai"

export default class MonsterFighter extends Fighter {

    constructor(fight) {
        super(fight);
        this._id = fight.incrementCacheValue("monsterId", true);
        this.ready = true;
        this.ai = new BasicAI(this);
    }

    get id() {
        return this._id;
    }

    get level() {
        return this.monster.grade.level;
    }

    get isAI() {
        return true;
    }

    send(packet) {}

    refreshStats() { }

    getGameFightMinimalStatsPreparation() {
        return new Types.GameFightMinimalStatsPreparation(this.current.life, this.getStats().getMaxLife(), this.getStats().getMaxLife(), this.getStats().getTotalStats(17), 0,
            this.current.AP, this.getStats().getTotalStats(1),
            this.current.MP, this.getStats().getTotalStats(2), 0, false, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000);
    }

    getGameFightFighterInformations() {
        var t = new Types.GameFightMonsterInformations(this.id, this.monster.getEntityLook(),
            new Types.EntityDispositionInformations(this.cellId, this.dirId), this.team.id, 0, this.alive, this.getGameFightMinimalStatsPreparation(), [],
            this.monster.template._id, this.monster.grade.grade);
        return t;
    }

    getFightTeamMemberCharacterInformations() {
        return new Types.FightTeamMemberMonsterInformations(this.id, this.monster.template._id, this.monster.grade.grade);
    }

    startBrain() {
        Logger.debug("Process AI for the monster id: " + this.id);
        this.ai.process();
    }
}