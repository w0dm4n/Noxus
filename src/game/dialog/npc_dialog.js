import * as Messages from "../../io/dofus/messages"
import Dialog from "../../game/npcs/replies/dialog"
import Teleport from "../../game/npcs/replies/teleport"

export default class NpcDialog {

    replies = [];
    replyType = { "dialog": { handle: Dialog.execute }  , "teleport" : {handle : Teleport.execute}};
    constructor(character, npc) {
        this.character = character;
        this.npc = npc;
    }

    open() {
        this.character.setDialog(this);
        this.character.client.send(new Messages.NpcDialogCreationMessage(this.npc.mapId, -this.npc._id));
        this.currentMessage = this.npc.currentMessage;
        this.changeMessage();
    }

    changeMessage() {

        var getReplies = this.npc.getReplies(this.currentMessage);
        if (getReplies.length > 0) {
            this.replies = getReplies;
            var result = [];
            for (var i in getReplies) {
                result.push(getReplies[i].replyId);
            }

            this.character.client.send(new Messages.NpcDialogQuestionMessage(this.currentMessage, ["0"], result));

        } else {
            this.close();
        }


    }

    reply(replyId) {
        var reply = this.existReply(replyId);
        if (reply != null) {
            var replyType = this.replyType[reply.type];
            if (replyType)
                replyType.handle(this.character, this.npc, reply);
            else
            {
                this.close();
            }

        } else {
            this.close();
        }

    }

    existReply(id) {
        for (var i in this.replies) {
            if (this.replies[i].replyId == id) {
                return this.replies[i];
            }
        }
        return null;
    }

    close() {
        if (this.character.client != null) {
            this.character.closeDialog(this);
            this.character.client.send(new Messages.LeaveDialogMessage(1));
        }
    }
}