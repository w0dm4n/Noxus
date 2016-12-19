import AddSwapDamage from "../buffs/add_swap_damage_buff"

export default class SwapDammage{
    static effectId = 1164;

    static process(data) {
        for(var t of data.targets) {
            t.addBuff(new AddSwapDamage(data.spell, data.spellLevel, data.effect, data.caster, data.caster));
        }
    }
}
module.exports = SwapDammage;