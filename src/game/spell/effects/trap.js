import Basic from "../../../utils/basic"
import MapPoint from "../../pathfinding/map_point"
import FightGlyph from "../../fight/fight_glyph"
import MarkTypeEnum from "../../../enums/mark_type_enum"

export default class Trap {

    static effectId = 400;

    static process(data) {
        console.log(data.spell);
        data.caster.fight.glyphs.push(new FightGlyph({caster: data.caster, fight: data.caster.fight, cells: data.shape, markType: MarkTypeEnum.TRAP,
            spell: data.spell, spellLevel: data.spellLevel, castCellId: data.cellId, effect: data.effect}));
    }
}

module.exports = Trap;