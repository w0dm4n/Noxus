import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import Datacenter from "../database/datacenter"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import PlayableBreedEnum from "../enums/playable_breed_enum"
import Character from "../database/models/character"
import WorldManager from "../managers/world_manager"
import CharacterManager from "../managers/character_manager.js"
import Loader from "../managers/loader_manager"
import FriendHandler from "../handlers/friend_handler"

export default class ItemHandler {

    static handleObjectSetPositionMessage(client, packet) {
        var item = client.character.itemBag.getItemByID(packet.objectUID);
        if(item) {
            if(client.character.itemBag.hasSameItemOnPos(item, packet.position))
            {
                client.character.sendInventoryBag();
                return;
            }
            client.character.itemBag.createStack(item, packet.quantity, function(stack) {
                //TODO: Check position validity
                var onPosItem = client.character.itemBag.moveItem(stack, packet.position);
                if(onPosItem) {
                    client.send(new Messages.ObjectMovementMessage(onPosItem._id, onPosItem.position));
                }
                client.send(new Messages.ObjectMovementMessage(stack._id, stack.position));
                client.character.statsManager.sendStats();
                client.character.sendInventoryBag();
                client.character.refreshLookOnMap();
                client.character.itemBag.save();
                Logger.debug("Item(id: " + stack._id + ") moved to position: " + packet.position);
            });
        }
        else {
            //TODO: Error ?
        }
    }
}