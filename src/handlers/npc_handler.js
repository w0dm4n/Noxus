
import DataCenter from "../database/datacenter"

export default class NpcHandler{

    static handleNpcGenericActionRequestMessage(client, packet){
        var npcs = client.character.getMap().getNpcMap(packet.npcId);
        if(npcs != null){
             npcs.open(client.character,packet.npcActionId);
        }     
    }
}