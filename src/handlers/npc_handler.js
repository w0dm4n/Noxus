
import DataCenter from "../database/datacenter"

export default class NpcHandler {

    static handleNpcGenericActionRequestMessage(client, packet) {
        var npcs = client.character.getMap().getNpcMap(packet.npcId);
        if (npcs != null) {
            npcs.open(client.character, packet.npcActionId);
        }
    }

    static handleNpcDialogReplyMessage(client, packet) {
        if (client.character.dialog != null) {
            if (client.character.dialog.constructor.name == "NpcDialog") {
                client.character.dialog.reply(packet.replyId);
            }
        }
    }

    static handleExchangeBuyMessage(client, packet){
        if(client.character.dialog != null){
            if(client.character.dialog.constructor.name == "ShopDialog"){
                client.character.dialog.buyItem(packet);
            }
        }
    }

    static handleExchangeSellMessage(client,packet){
        if(client.character.dialog != null){
            if(client.character.dialog.constructor.name == "ShopDialog"){
                client.character.dialog.sellItem(packet);
            }
        }
    }
}