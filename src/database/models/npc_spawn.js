import NpcBuySell from "../../game/npcs/npcBuySell"
import NpcTalk from "../../game/npcs/npcTalk"

export default class NpcSpawn {

    static handlerAction =
    {
        1: { handle: NpcBuySell.execute },
        2: { handle: "" },
        3: { handle: NpcTalk.execute }

    };
    constructor(raw, look, actions , messages , replies) {
        this._id = raw._id;
        this.npcId = raw.npcId;
        this.mapId = raw.mapId;
        this.cellId = raw.cellId;
        this.direction = raw.direction;
        this.realLook = look;
        this.actions = actions;
        this.messages = messages;
        this.replies = replies;

    }

    open(character, action) {

        if (this.canOpen(character, action)) {
            var handler = NpcSpawn.handlerAction[action];
            if (handler)
                handler.handle(character, this);
            else
                Logger.error("No handler found for action npc" + action);

        }
    }

    canOpen(character, action) {
        if (character.mapid == this.mapId && !character.isInFight() && !character.requestedFighterId && this.actions.length > 0 && this.actionExist(action)) {
            return true;
        }
        return false;
    }

    actionExist(action) {
        for (var i in this.actions) {
            if (this.actions[i] == action) {
                return true;
            }
        }
        return false;
    }
}