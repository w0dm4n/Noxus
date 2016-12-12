import NpcDialog from "../../dialog/npc_dialog"
export default class NpcTalk{
    
    action = 3;

    static execute(character,npc){
        var npc = new NpcDialog(character,npc);
        npc.open();
    }
}