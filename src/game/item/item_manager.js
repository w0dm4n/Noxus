import Datacenter from "../../database/datacenter"
import ItemDiceEffect from "./item_dice_effect"
import ItemEffectInteger from "./item_effect_integer"
import Basic from "../../utils/basic"
import CharacterItem from "../../database/models/character_item";

export default class ItemManager {

    static getItemTemplateById(id) {
        return Datacenter.items.filter(function (x) {
            if (x._id == id) return x;
        })[0];
    }

    static generateItem(itemId) {
        var itemTemplate = ItemManager.getItemTemplateById(itemId);
        var effectsGenerated = [];
        for(var effect of itemTemplate.possibleEffects) {
            effectsGenerated.push(ItemManager.generateRandomEffect(effect));
        }

        var item = new CharacterItem({templateId: itemId, effects: effectsGenerated, quantity: 1});
        return item;
    }

    static generateRandomEffect(effect) {
        var randomableEffects = [118, 126]; // Effects who can be random

        if(randomableEffects.indexOf(effect.effectId) != -1) { // ObjectEffectInteger
            let lowValue = effect.diceNum;
            let highValue = effect.diceSide;
            let randomValue = Basic.getRandomInt(lowValue, highValue);
            let diceEffect = new ItemEffectInteger(randomValue, effect.effectId, "ObjectEffectInteger");
            return diceEffect;
        }
    }
}