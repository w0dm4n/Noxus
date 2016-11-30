import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import ItemManager from "../../game/item/item_manager"

export default class CharacterItem {

    static DEFAULT_SLOT = 63;

    constructor(raw) {
        this._id = raw._id ? raw._id : -1;
        this.characterId = raw.characterId;
        this.templateId = raw.templateId;
        this.effects = raw.effects;
        this.position = CharacterItem.DEFAULT_SLOT;
        this.quantity = raw.quantity;
    }

    getTemplate() {
        return ItemManager.getItemTemplateById(this.templateId);
    }

    getObjectItem() {
        var effects = [];
        for(var effect of this.effects) {
            effects.push(effect.getObjectEffect());
        }
        return new Types.ObjectItem(this.position, this.templateId, effects, this._id, this.quantity);
    }
}