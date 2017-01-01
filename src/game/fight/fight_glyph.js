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
        if (this.getShape() == "P")
            return 0;
        else
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

    getMarkedCells(forOpposite = false)
    {
        var markedCells = [];
        if (forOpposite) {
            return markedCells;
        }
        else {
            markedCells.push(new Types.GameActionMarkedCell(this.centerCell, this.getRadius(), this.effect.value, this.getCellsType()));
        }
        return markedCells;
    }

    getMark(forOpposite = false)
    {
        return new Types.GameActionMark(this.caster.id, this.caster.team.id, this.spell.spellId, this.spellLevel.grade, this.id, this.getMarkType(),
            (forOpposite) ? -1 : this.centerCell, this.getMarkedCells(forOpposite), true);
    }

    showGlyphToFight(all)
    {
        if (this.markType == MarkTypeEnum.TRAP)
        {
            this.caster.team.send(new Messages.GameActionFightMarkCellsMessage(0, this.caster.id, this.getMark()));
            var oppositeTeam = this.fight.getOppositeTeam(this.caster.team);
            oppositeTeam.send(new Messages.GameActionFightMarkCellsMessage(0, this.caster.id, this.getMark(true)));
        }
        else {
            //this.fight.send();
        }
    }

    getFightersOnGlyph()
    {
        var fighters = [];
        for (var cell of this.cells)
        {
            var fighter = this.fight.getFighterOnCell(cell);
            if (fighter)
                fighters.push(fighter);
        }
        return fighters;
    }

    getCastInformations() {
        var spell = SpellManager.getSpell(this.effect.diceNum);
        if (spell) {
            var id = spell.spellLevels[this.spellLevel.grade];
            if (id > 0)
            {
                var spellLevel = SpellManager.getSpellLevelById(id);
                if (spellLevel) {
                    return {spell: spell, spellLevel: spellLevel};
                }
            }
        }
        return null;
    }

    apply(source, callback)
    {
        source.sequenceCount++;
        this.fight.send(new Messages.SequenceStartMessage(1, source.id));

        this.fight.send(new Messages.GameActionFightTriggerGlyphTrapMessage(306, this.caster.id, this.id, source.id, this.spell.spellId));
        this.fight.send(new Messages.GameActionFightUnmarkCellsMessage(310, this.caster.id, this.id));

        var fighters = this.getFightersOnGlyph();
        if (fighters.length > 0) {
            for (var fighter of fighters)
            {
                var data = this.getCastInformations();
                if (data) {
                    FightSpellProcessor.process(this.fight, this.caster, data.spell, data.spellLevel, data.spellLevel.effects, this.centerCell, fighter, this.centerCell);
                }
                else
                    Logger.debug("Data not found for glyph");
            }
        }
        else
            Logger.debug("No fighter found for glyph effect !");
        this.fight.send(new Messages.SequenceEndMessage(source.sequenceCount, source.id, 1));
        this.dispose();
        if (callback)
            callback();
    }

    dispose()
    {
        var index = this.fight.glyphs.indexOf(this);
        if (index != -1) {
            this.fight.glyphs.splice(index, 1);
            Logger.debug("Glyph with id " + this.id + " removed !");
        }
    }
}