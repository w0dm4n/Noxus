import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Logger from "../../io/logger"

export default class Fighter {

    constructor(character, fight) {
        this.character = character;
        this.fight = fight;
        this.character.fighter = this;
        this.team = null;
        this.ready = false;
        this.cellId = -1;
        this.dirId = 3;
        this.alive = true;

        this.current = { life: this.character.life, AP: this.character.statsManager.getTotalStats(1), MP: this.character.statsManager.getTotalStats(2) }
    }

    send(packet) {
        this.character.client.send(packet);
    }

    createContext() {
        this.send(new Messages.GameContextDestroyMessage());
        this.send(new Messages.GameContextCreateMessage(2));
    }

    getGameFightMinimalStatsPreparation() {
        return new Types.GameFightMinimalStatsPreparation(this.current.life, this.character.statsManager.getMaxLife(), this.character.statsManager.getMaxLife(), 0, 0,
            this.current.AP, this.character.statsManager.getTotalStats(1),
            this.current.MP, this.character.statsManager.getTotalStats(2),
            0, false, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000);
    }

    getGameFightFighterInformations() {
        return new Types.GameFightMutantInformations(this.character._id, this.character.getEntityLook(),
            new Types.EntityDispositionInformations(this.cellId, this.dirId), this.team.id, 0, this.alive, this.getGameFightMinimalStatsPreparation(), [],
            this.character.name, new Types.PlayerStatus(1), this.character.level);
    }
}