export default class ItemBag {

    constructor() {
        this.items = [];
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

    add(item) {
        this.items.push(item);
        if(this.onItemAdded) this.onItemAdded(item);
    }

    getObjectItemArray() {
        var objects = [];
        for(var item of this.items) {
            objects.push(item.getObjectItem());
        }
        return objects;
    }

    save() {

    }
}