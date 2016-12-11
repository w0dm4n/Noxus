import PartyType from "../../enums/party_type"
import Logger from "../../io/logger"
import WorldServer from "../../network/world"
import Datacenter from "../../database/datacenter"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import PartyFollower from "../../game/party/party_follower"
import CompassEnum from "../../enums/compass_type_enum"
import ExchangeType from "../../enums/exchange_type_enum"
import Exchange from "./exchange"
import ItemManager from "../../game/item/item_manager"

export default class ExchangePlayer {

    type = 11;
    firstActor = null;
    secondActor = null;
    firstActorItem = [];
    firstActorKamas = 0;

    secondActorItem = [];
    secondActorKamas = 0;

    constructor(type, firstActor, secondActor)
    {
        this.firstActor = firstActor;
        this.secondActor = secondActor;
        this.firstActor.setDialog(this);
        this.secondActor.setDialog(this);
        this.sendRequest();
    }

    sendToActors(message)
    {
        try { this.firstActor.client.send(message); } catch (error) { Logger.error(error); }
        try { this.secondActor.client.send(message); } catch (error) { Logger.error(error); }
    }

    sendRequest()
    {
        this.sendToActors(new Messages.ExchangeRequestedTradeMessage(ExchangeType.PLAYER_TRADE, this.firstActor._id, this.secondActor._id));
    }

    close(success = false)
    {
        if (this.firstActor != null && this.secondActor != null) {

            this.firstActor.closeDialog(this);
            this.secondActor.closeDialog(this);
            this.sendToActors(new Messages.ExchangeLeaveMessage(this.type, success));

            this.firstActor.exchange = null;
            this.firstActor.isReady = false;
            this.firstActor.isFirst = false;

            this.secondActor.exchange = null;
            this.secondActor.isReady = false;
            this.secondActor.isFirst = false;
        }
    }

    getActor(character)
    {
        if (character._id == this.firstActor._id) {
            this.firstActor.isFirst = true;
            return this.firstActor;
        }
        else if (character._id == this.secondActor._id) {
            this.firstActor.isFirst = false;
            return this.secondActor;
        }
        else return null;
    }

    acceptExchange()
    {
        this.sendToActors(new Messages.ExchangeStartedWithPodsMessage(ExchangeType.PLAYER_TRADE, this.firstActor._id, 0, 1000, this.secondActor._id, 0, 1000));
    }

    updateKamas(character, quantity)
    {
        if (quantity < 0)
            return;
        if (character._id == this.firstActor._id || character._id == this.secondActor._id)
        {
            if (character.itemBag
                && character.itemBag.money >= quantity) {
                var actor = this.getActor(character);
                if (actor)
                {
                    actor.client.send(new Messages.ExchangeKamaModifiedMessage(false, quantity));
                    if (actor.isFirst) {
                        this.setReady(this.firstActor, false);
                        this.secondActor.client.send(new Messages.ExchangeKamaModifiedMessage(true, quantity));
                        this.firstActorKamas = quantity;
                    }
                    else if (!actor.isFirst) {
                        this.setReady(this.secondActor, false);
                        this.firstActor.client.send(new Messages.ExchangeKamaModifiedMessage(true, quantity));
                        this.secondActorKamas = quantity;
                    }
                }
            }
        }
    }

    getItemCopy(item, quantity)
    {
        var tmp = ItemManager.generateItem(item.templateId);
        tmp.effects = item.effects;
        tmp.quantity = quantity;
        tmp._id = item._id;
        tmp.position = 63;
        return tmp;
    }

    removeFirstActorItem(item)
    {
        var index = this.firstActorItem.indexOf(item);
        if (index != -1)
            this.firstActorItem.splice(index, 1);

        this.firstActor.client.send(new Messages.ExchangeObjectRemovedMessage(false, item._id));
        this.secondActor.client.send(new Messages.ExchangeObjectRemovedMessage(true, item._id));
        this.setReady(this.firstActor, false);
    }

    removeSecondActorItem(item)
    {
        var index = this.secondActorItem.indexOf(item);
        if (index != -1)
            this.secondActorItem.splice(index, 1);

        this.firstActor.client.send(new Messages.ExchangeObjectRemovedMessage(true, item._id));
        this.secondActor.client.send(new Messages.ExchangeObjectRemovedMessage(false, item._id));
        this.setReady(this.secondActor, false);
    }

    addFirstActorItem(item, quantity)
    {
        var tmp = this.getItemCopy(item, quantity);
        this.firstActorItem.push(tmp);
        this.firstActor.client.send(new Messages.ExchangeObjectAddedMessage(false, tmp.getObjectItem()));
        this.secondActor.client.send(new Messages.ExchangeObjectAddedMessage(true, tmp.getObjectItem()));
        this.setReady(this.firstActor, false);
    }

    addSecondActorItem(item, quantity)
    {
        var tmp = this.getItemCopy(item, quantity);
        this.secondActorItem.push(tmp);
        this.firstActor.client.send(new Messages.ExchangeObjectAddedMessage(true, tmp.getObjectItem()));
        this.secondActor.client.send(new Messages.ExchangeObjectAddedMessage(false, tmp.getObjectItem()));
        this.setReady(this.secondActor, false);
    }

    getFirstItemById(id)
    {
        for (var i in this.firstActorItem)
        {
            if (this.firstActorItem[i]._id == id)
                return this.firstActorItem[i];
        }
        return null;
    }

    getSecondItemById(id)
    {
        for (var i in this.secondActorItem)
        {
            if (this.secondActorItem[i]._id == id)
                return this.secondActorItem[i];
        }
        return null;
    }

    checkFirstItemQuantity(objectUID)
    {
        var items = this.firstActorItem;
        for (var i in items)
        {
            if (items[i]._id == objectUID)
                return true;
        }
        return false;
    }

    checkSecondItemQuantity(objectUID)
    {
        var items = this.secondActorItem;
        for (var i in items)
        {
            if (items[i]._id == objectUID)
                return true;
        }
        return false;
    }

    addFirstQuantityToItem(template, objectUID, quantity)
    {
        var item = this.getFirstItemById(objectUID);
        if (item && (item.quantity + quantity) <= template.quantity)
        {
            item.quantity += quantity;
            this.firstActor.client.send(new Messages.ExchangeObjectModifiedMessage(false, item.getObjectItem()));
            this.secondActor.client.send(new Messages.ExchangeObjectModifiedMessage(true, item.getObjectItem()));
            this.setReady(this.firstActor, false);
        }
    }

    addSecondQuantityToItem(template, objectUID, quantity)
    {
        var item = this.getSecondItemById(objectUID);
        if (item && (item.quantity + quantity) <= template.quantity)
        {

            item.quantity += quantity;
            this.firstActor.client.send(new Messages.ExchangeObjectModifiedMessage(true, item.getObjectItem()));
            this.secondActor.client.send(new Messages.ExchangeObjectModifiedMessage(false, item.getObjectItem()));
            this.setReady(this.secondActor, false);
        }
    }

    addItem(actor, objectUID, quantity)
    {
        var item = actor.itemBag.getItemByID(objectUID);
        if (item && item.quantity >= quantity)
        {
            if (actor.isFirst && this.checkFirstItemQuantity(objectUID))
            {
                this.addFirstQuantityToItem(item, objectUID, quantity);
            }
            else if (actor.isFirst)
            {
                this.addFirstActorItem(item, quantity);
            }
            else if (!actor.isFirst && this.checkSecondItemQuantity(objectUID))
            {
                this.addSecondQuantityToItem(item, objectUID, quantity);
            }
            else if (!actor.isFirst)
            {
                this.addSecondActorItem(item, quantity);
            }
            else
                actor.replyImportant("Impossible de bouger votre objet.");
        }
    }

    removeFirstQuantityFromItem(objectUID, quantity)
    {
        var item = this.getFirstItemById(objectUID);
        if (item)
        {
            var res = (item.quantity - (-quantity));
            if (res > 0) {
                item.quantity = res;

                this.firstActor.client.send(new Messages.ExchangeObjectModifiedMessage(false, item.getObjectItem()));
                this.secondActor.client.send(new Messages.ExchangeObjectModifiedMessage(true, item.getObjectItem()));
                this.setReady(this.firstActor, false);
            }
            else
            {
                this.removeFirstActorItem(item);
            }

        }
    }

    removeSecondQuantityFromItem(objectUID, quantity)
    {
        var item = this.getSecondItemById(objectUID);
        if (item)
        {
            var res = (item.quantity - (-quantity));
            if (res > 0) {
                item.quantity = res;

                this.firstActor.client.send(new Messages.ExchangeObjectModifiedMessage(false, item.getObjectItem()));
                this.secondActor.client.send(new Messages.ExchangeObjectModifiedMessage(true, item.getObjectItem()));
                this.setReady(this.secondActor, false);
            }
            else
            {
                this.removeSecondActorItem(item);
            }

        }
    }

    removeItem(actor, objectUID, quantity)
    {
        var item = actor.itemBag.getItemByID(objectUID);
        if (item)
        {
            if (actor.isFirst && this.checkFirstItemQuantity(objectUID))
            {
                this.removeFirstQuantityFromItem(objectUID, quantity);
            }
            else if (!actor.isFirst && this.checkSecondItemQuantity(objectUID))
            {
                this.removeSecondQuantityFromItem(objectUID, quantity);
            }
        }
    }

    moveItem(actor, objectUID, quantity)
    {
        var actor = this.getActor(actor);
        if (actor)
        {
            if (quantity > 0) {
                this.addItem(actor, objectUID, quantity);
            }
            else
            {
                this.removeItem(actor, objectUID, quantity);
            }
        }
    }

    deleteAndGive(callback)
    {
        var self = this;
        if (this.firstActorKamas > 0) {
            this.firstActor.subKamas(this.firstActorKamas, false);
            this.secondActor.addKamas(this.firstActorKamas, false);
        }

        if (this.firstActorItem.length > 0)
        {
            var items = this.firstActorItem;
            for (var i in items) {
                var newItem = this.getItemCopy(items[i], items[i].quantity);
                newItem._id = -1;
                this.secondActor.itemBag.add(newItem, items[i].quantity, null);
                this.firstActor.itemBag.updateItemByUIDAndQuantity(items[i]._id, items[i].quantity, this.firstActor.client);
            }
        }

        if (this.secondActorItem.length > 0)
        {
            var items = this.secondActorItem;
            for (var i in items) {
                var newItem = this.getItemCopy(items[i], items[i].quantity);
                newItem._id = -1;
                this.firstActor.itemBag.add(newItem, items[i].quantity, null);
                this.secondActor.itemBag.updateItemByUIDAndQuantity(items[i]._id, items[i].quantity, this.secondActor.client);
            }
        }

        if (this.secondActorKamas > 0) {
            this.secondActor.subKamas(this.secondActorKamas, false);
            this.firstActor.addKamas(this.secondActorKamas, false);
        }
        setTimeout(function() {
            self.firstActor.sendInventoryBag();
            self.secondActor.sendInventoryBag();
        }, 1500);
        callback(self);
    }

    setReady(character, state)
    {
        var actor = this.getActor(character);
        if (actor)
        {
            if (actor.isFirst)
                this.firstActor.isReady = state;
            else if (!actor.isFirst)
                this.secondActor.isReady = state;
            this.sendToActors(new Messages.ExchangeIsReadyMessage(actor._id, state));
        }
        if (this.firstActor.isReady && this.secondActor.isReady)
        {
            this.deleteAndGive(function(self) {
                self.close(true);
            });
        }
    }
}

module.exports = ExchangePlayer;