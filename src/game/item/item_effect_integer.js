import ItemDiceEffect from "./item_dice_effect"
import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"

export default class ItemEffectInteger extends ItemDiceEffect {

    constructor(value, effectId, effectType) {
        super(effectId, effectType)
        this.value = value;
    }

    getObjectEffect() {
        return new Types.ObjectEffectInteger(this.effectId, this.value);
    }

}