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
import CharacterItem from "../database/models/character_item"

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
                if(ItemHandler.checkPositionValidity(client, item, packet.quantity, packet.position)) {
                    var onPosItem = client.character.itemBag.moveItem(stack, packet.position);
                    if(onPosItem) {
                        client.send(new Messages.ObjectMovementMessage(onPosItem._id, onPosItem.position));
                    }
                    client.send(new Messages.ObjectMovementMessage(stack._id, stack.position));
                    CharacterManager.applyRegen(client.character);
                    client.character.statsManager.sendStats();
                    client.character.sendInventoryBag();
                    client.character.refreshLookOnMap();
                    client.character.itemBag.save();
                    Logger.debug("Item(id: " + stack._id + ") moved to position: " + packet.position);
                }
                else {
                    client.character.sendInventoryBag();
                    client.character.itemBag.save();
                    Logger.debug("Item(id: " + stack._id + ") can't be moved to position: " + packet.position);
                }
            });
        }
        else {
            client.send(new Messages.BasicNoOperationMessage());
        }
    }

    static checkPositionValidity(client, item, quantity, position) {
        if(client.character.level < item.getTemplate().level) {
            client.send(new Messages.ObjectErrorMessage(7)); // Level too low
            return false;
        }

        // Hat
        if(position != CharacterItem.DEFAULT_SLOT) {
            if(item.getTemplate().typeId == 16 && position != 6) {
                client.send(new Messages.ObjectErrorMessage(10)); // Can't equip here
                return false;
            }

            // Check twice equipment
            if(client.character.itemBag.hasAlreadyWearedItem(item.templateId)){
                client.send(new Messages.ObjectErrorMessage(2)); // Can't equip twice
                return false;
            }

            // Check double equip by quantity
            if(quantity != 1) {
                client.send(new Messages.ObjectErrorMessage(10)); // Can't equip here
                return false;
            }
        }

        return true;
    }

    static handleObjectDeleteMessage(client, packet) {
        var item = client.character.itemBag.getItemByID(packet.objectUID);
        if(item && packet.quantity > 0) {
            if(item.quantity >= packet.quantity) {
                item.quantity -= packet.quantity;
                if(item.quantity <= 0) { // Delete
                    client.character.itemBag.deleteItem(item);
                }
                else { // Refresh quantity
                    client.send(new Messages.ObjectQuantityMessage(item._id, item.quantity));
                }

                client.character.statsManager.sendStats();
                client.character.sendInventoryBag();
                client.character.refreshLookOnMap();
            }

            client.send(new Messages.BasicNoOperationMessage());
        }
        else {
            client.send(new Messages.BasicNoOperationMessage());
        }
    }
}