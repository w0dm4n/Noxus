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
            this.items.push(rebuildedItem);
        }
        this.money = raw.money;
    }

    add(item, callback) {
        var self = this;
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

    create(callback) {
        DBManager.createItembag(this, function(bag) {
            callback();
        });
    }

    save(callback) {
        DBManager.saveItembag(this, { items: this.items, money: this.money }, function() {
            callback();
        });
    }
}