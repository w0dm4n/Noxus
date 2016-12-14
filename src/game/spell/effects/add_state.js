import Basic from "../../../utils/basic"
import AddStateBuff from "../buffs/add_state_buff"

export default class AddState {

    static effectId = 950;

    static process(data) {
        for(var t of data.targets) {
            t.addBuff(new AddStateBuff(data.effect.value, data.spell, data.spellLevel, data.effect, data.caster, t));
        }
    }
}

module.exports = AddState;