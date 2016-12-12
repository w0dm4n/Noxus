import NpcBuySell from "../../game/npcs/actions/npcBuySell"
import NpcTalk from "../../game/npcs/actions/npcTalk"
import Datacenter from "../../database/datacenter"
export default class NpcSpawn {


    static handlerAction =
    {
        1: { handle: NpcBuySell.execute },
        2: { handle: "" },
        3: { handle: NpcTalk.execute }
    };

    currentMessage;
    items = [];

    constructor(raw, look, actions  ) {
        this._id = raw._id;
        this.npcId = raw.npcId;
        this.mapId = raw.mapId;
        this.cellId = raw.cellId;
        this.direction = raw.direction;
        this.realLook = look;
        this.actions = actions;
        var replies = this.existReplies();

        if(replies != null){
            this.currentMessage = replies.messageId;     
        }
        var items = Datacenter.getNpcItems(this.npcId);

        if(items.length > 0){
            for(var i in items){
                this.items.push(items[i]);
            }
        }

    }

    getReplies(messageId){
        return Datacenter.getNpcReplies(messageId);       
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
            if (this.actions[i].action == action) {
                return true;
            }
        }
        return false;
    }

    existReplies(){
        for(var i in this.actions){
            if(this.actions[i].action == 3){
                return this.actions[i];
            }
        }
        return null;
    }


}