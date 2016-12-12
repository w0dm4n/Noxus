
import DataCenter from "../database/datacenter"

export default class NpcHandler{

    static handleNpcGenericActionRequestMessage(client, packet){
        var npcs = client.character.getMap().getNpcMap(packet.npcId);
        if(npcs != null){
             npcs.open(client.character,packet.npcActionId);
        }     
    }

    static handleNpcDialogReplyMessage(client,packet){
        if(client.character.dialog != null){
            //todo : add verification talk with npcs
            client.character.dialog.reply(packet.replyId);
        }
    }
}