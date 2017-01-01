import LookBuff from "../buffs/add_look_buff"

export default class ChangeApparence335 {
    static effectId = 335;
    static skins = {
        2880: { skinId: [1448, 1443] },
        2879: { skinId: [1450, 1449] }
    };

    static process(data) {
        for (var t of data.targets) {
            var skin = ChangeApparence335.skins[data.spell.spellId];

            if (skin != null) {
                var sex;
                if (t.character.sex == false)
                    sex = skin.skinId[1];
                else
                    sex = skin.skinId[0];

                t.addBuff(new LookBuff(sex, data.spell, data.spellLevel, data.effect, data.caster, t));
            }
        }
    }


}
module.exports = ChangeApparence335;