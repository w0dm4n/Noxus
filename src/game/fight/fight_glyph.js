import Logger from "../../io/logger"
import FightTeam from "./fight_team"
import Fighter from "./fighter"
import FightTimeline from "./fight_timeline"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Basic from "../../utils/basic"
import MapPoint from "../../game/pathfinding/map_point"
import Pathfinding from "../../game/pathfinding/pathfinding"
import SpellManager from "../spell/spell_manager"
import FightSpellProcessor from "./fight_spell_processor"
import * as Shapes from "./fight_shape_processor"
import Dofus1Line from "../map_tools/dofus_1_line"
import InvisibilityStateEnum from "../../enums/invisibility_state_enum"
import MarkTypeEnum from "../../enums/mark_type_enum"
import MarkCellsTypeEnum from "../../enums/mark_cells_type_enum"

export default class FightGlyph {

    caster = null;
    fight = null;
    cells = null;
    centerCell = 0;
    markType = 0;
    id = 0;

    constructor(data)
    {
        this.caster = data.caster;
        this.fight = data.caster.fight;
        this.cells = data.cells;
        this.markType = data.markType;
        this.spell = data.spell;
        this.spellLevel = data.spellLevel;
        this.centerCell = data.castCellId;
        this.effect = data.effect;
        this.id = this.generateId();
        this.showGlyphToFight();
    }

    generateId()
    {
        var index = 0;
        for (var glyph of this.fight.glyphs)
            index++;
        index += 1;
        return index;
    }

    getMarkType()
    {
        return this.markType;
    }

    getShape()
    {
        return this.effect.rawZone[0];
    }

    getRadius()
    {
        return this.effect.rawZone[1];
    }

    getCellsType()
    {
        switch (this.getShape())
        {
            case "C":
                return MarkCellsTypeEnum.CELLS_CIRCLE;
                break;

            case "X":
                return MarkCellsTypeEnum.CELLS_CROSS;
                break;

            case "P":
                return 0;
                break;

            default:
                return MarkCellsTypeEnum.CELLS_SQUARE;
                break;
        }
    }

    getMarkedCells()
    {
        var markedCells = [];
        var cellsType = this.getCellsType();

        for (var cell of this.cells)
            markedCells.push(new Types.GameActionMarkedCell(this.centerCell, this.getRadius(), this.effect.value, cellsType));
        return markedCells;
    }

    getMark()
    {
        return new Types.GameActionMark(this.caster.id, this.caster.team.id, this.spell._id, 1, this.id, this.getMarkType(),
        this.centerCell, this.getMarkedCells(), true);
    }

    showGlyphToFight()
    {
        var message = new Messages.GameActionFightMarkCellsMessage(0, this.caster.id, this.getMark());
        if (this.markType == MarkTypeEnum.TRAP)
        {
            this.caster.team.send(message);
        }
        else {
            //this.fight.send();
        }
    }
}