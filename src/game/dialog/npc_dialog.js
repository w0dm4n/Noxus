import * as Messages from "../../io/dofus/messages"

export default class NpcDialog{

    constructor(character,npc){
        this.character = character;
        this.npc = npc;
    }

    open(){
        this.character.setDialog(this);
        this.character.client.send(new Messages.NpcDialogCreationMessage(this.npc.mapId,-this.npc._id));
        this.character.client.send(new Messages.NpcDialogQuestionMessage(291,["0"],[231,26269]));
}

    close(){
        if (this.character.client != null) {
            this.character.closeDialog(this);
            this.character.client.send(new Messages.LeaveDialogMessage(1));
        }
    }
}