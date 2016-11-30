import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"

export default class ItemDiceEffect {

    constructor(value, effectId, effectType) {
        this.value = value;
        this.effectId = effectId;
        this.effectType = effectType;
    }

    getObjectEffect() {
        if(this.effectType == "ObjectEffectInteger") {
            return new Types.ObjectEffectInteger(this.effectId, this.value);
        }
    }
}