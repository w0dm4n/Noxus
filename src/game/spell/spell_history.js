import SpellHistoryInformation from "../../game/spell/spell_history_information"

export default class SpellHistory {

    spellStack = [];

    constructor(actor) {
        this.actor = actor;
    }

    insertSpell(spell, target) {

        this.spellStack.push(new SpellHistoryInformation(spell, target, this.actor.fight.timeline.round));
    }

    canCastSpell(spell, cell) {
        if (this.actor.alive) {
            var result;
            var SpellHistory = this.getLastSpell(spell.spellId);
            var round = this.actor.fight.timeline.round;
            if (SpellHistory == null && round < spell.initialCooldown) {
                result = false;
            } else {
                if (SpellHistory == null) {
                    result = true;
                } else {

                    if (SpellHistory.getElapsedRoundSpell(round)) {
                        result = false;
                    } else {
                        var array = this.getSpellCastTurn(spell.spellId).length;

                        if (array.length == 0) {
                            result = true;
                        } else {
                            if ((spell.maxCastPerTurn > 0) && (array.length >= spell.maxCastPerTurn)) {
                                result = false;
                            } else {
                                var target = this.actor.fight.getFighterOnCell(cell);
                                if (target == null) {
                                    result = true;
                                } else {
                                    var count = this.getSpellPerTarget(target).length;
                                    if ((spell.maxCastPerTarget <= 0) || (count < spell.maxCastPerTarget)) {
                                        result = true;
                                    } else {
                                        result = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }
    }

    getLastSpell(spellId) {
        if (this.spellStack == null || this.spellStack.length == 0) {
            return null;
        } else {
            var lastarray = [];
            for (var m in this.spellStack) {
                if (this.spellStack[m].spell.spellId == spellId)
                    lastarray.push(this.spellStack[m]);
            }
            if (lastarray.length > 0)
                return lastarray[lastarray.length - 1];
            // a revoir aprés;
            /* for (var i = (this.spellStack.length - 1); i >= 0; i--) {
              if (this.spellStack[i].spell.spellId == spellId)
                     return this.spellStack[i];   
             }*/
        }
        return null;
    }

    getSpellCastTurn(spellId) {
        var result = [];
        for (var i of this.spellStack) {
            if ((i.spell.spellId == spellId) && (i.round == this.actor.fight.timeline.round)) {
                result.push(i);
            }
        }

        return result;
    }

    getSpellPerTarget(target) {
        var result = [];
        for (var i of this.spellStack) {
            if ((i.target != null) && (i.target == target)) {
                if ((i.round == this.actor.fight.timeline.round)) {
                    result.push(i);
                }
            }
        }
        return result;
    }

    getHistorySpell(spellId) {

        var round = this.actor.fight.timeline.round;
        for (var i = (this.spellStack.length - 1); i >= 0; i--) {
            if ((this.spellStack[i].spell.spellId == spellId) && (this.spellStack[i].getElapsedRoundSpell(round) == true)) {
                return this.spellStack[i];
            }
        }

        return null;
    }

}