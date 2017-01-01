export default class DropItem  {

    constructor(dropId, percentOfChance, itemId) {
        this.dropId = dropId;
        this.percentOfChance = percentOfChance;
        this.itemId = itemId;
    }

    getItemId() {
        return this.itemId;
    }

    getPercentChanceOfDrop() {
        return this.percentOfChance;
    }

}