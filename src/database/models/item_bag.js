import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import IO from "../../io/custom_data_wrapper"
import DBManager from "../../database/dbmanager"
import CharacterItem from "./character_item"

export default class ItemBag {

    constructor() {
        this.items = [];
        this.money = 0;
        this.onItemAdded = null;
        this.onItemDeleted = null;
        this.onItemUpdated = null;
        this.onMoneyUpdated = null;
    }

    unbind() {
        this.onItemAdded = null;
        this.onItemDeleted = null;
        this.onItemUpdated = null;
        this.onMoneyUpdated = null;
    }

    fromRaw(raw) {
        this._id = raw._id;
        this.items = [];
        for(var item of raw.items) {
            var rebuildedItem = new CharacterItem(item);
            rebuildedItem.rebuildEffects();
            rebuildedItem.position = item.position;
            this.items.push(rebuildedItem);
        }
        this.money = parseInt(raw.money);
    }

    add(item, checkSame, callback) {
        var self = this;
        if(checkSame) {
           var sameItem = this.hasSame(item);
           if(sameItem){
               if(sameItem.position == CharacterItem.DEFAULT_SLOT) {
                   sameItem.quantity += item.quantity;
                   self.save(function(){
                       if(callback) callback();
               });
                   if(self.onItemAdded) self.onItemAdded(this.hasSame(sameItem));
                   return;
               }
           }
        }
        this.items.push(item);
        item.create(function(){
            self.save(function(){
                if(callback) callback();
            });
            if(self.onItemAdded) self.onItemAdded(item);
        });
    }



    getObjectItemArray() {
        var objects = [];
        for(var item of this.items) {
            objects.push(item.getObjectItem());
        }
        return objects;
    }
    getItemByUID(id) {
        for(var item of this.items) {
           if(item.templateId == id) return item;
        }
        return null;
    }
    getItemByID(id) {
        for(var item of this.items) {
            if(item._id == id) return item;
        }
        return null;
    }

    hasSame(same) {
        for(var item of this.items) {
            if(item.isSame(same)) return item;
        }
        return null;
    }

    createStack(item, quantity, callback) {
        var self = this;
        if(item.quantity == quantity){
            callback(item);
            return;
        }
        if(item.quantity < quantity) {
            callback(null);
            return;
        }
        var newStack = new CharacterItem({templateId: item.templateId, effects: item.copyEffects(), quantity: quantity});
        item.quantity -= quantity;
        this.add(newStack, false, function() {
            if(self.onItemUpdated) self.onItemUpdated(item);
            callback(newStack);
        });
    }

    getItemAtPosition(position) {
        for(var item of this.items) {
            if(item.position == position) return item;
        }
        return null;
    }

    hasAlreadyWearedItem(templateId) {
        for(var item of this.items) {
            if(item.position != CharacterItem.DEFAULT_SLOT && item.getTemplate()._id == templateId) return true;
        }
        return false;
    }

    moveItem(item, position) {
        var self = this;
        var itemOnPos = this.getItemAtPosition(position);
        if(itemOnPos) {
            var sameItem = this.hasSame(item);
            itemOnPos.position = CharacterItem.DEFAULT_SLOT;
            if(sameItem) {
                if(sameItem.position == CharacterItem.DEFAULT_SLOT) {
                    sameItem.quantity += item.quantity;
                    self.deleteItem(item);
                    return;
                }
            }
        }
        item.position = position;
        return itemOnPos;
    }

    hasSameItemOnPos(item, position) {
        var itemOnPos = this.getItemAtPosition(position);
        if(itemOnPos) {
            var sameItem = this.hasSame(itemOnPos);
            if(sameItem) {
                return true;
            }
        }
        return false;
    }

    deleteItem(item) {
        this.items.splice(this.items.indexOf(item), 1);
        this.save();
        if(this.onItemDeleted) this.onItemDeleted(item);
    }

    updateItemByTemplateIdAndQuantity(id, quantity){
        var item = this.getItemByUID(id);
        if(item != null){
            if (quantity < item.quantity)
                    item.quantity -= quantity;
                else {
                    this.deleteItem(item);
                }
                this.save(function(){ });
        }
    }
    updateItemByUIDAndQuantity(objectUID, quantity, client)
    {
        var self = this;
        for (var i in this.items)
        {
            if (this.items[i]._id == objectUID)
            {
                if (quantity < this.items[i].quantity)
                    this.items[i].quantity -= quantity;
                else {
                    this.deleteItem(this.items[i]);
                }
                self.save(function(){ });
                break;
            }
        }
    }

    create(callback) {
        DBManager.createItembag(this, function(bag) {
            if(callback) callback();
        });
    }

    save(callback) {
        DBManager.saveItembag(this, { items: this.items, money: this.money }, function() {
            if(callback) callback();
        });
    }
}