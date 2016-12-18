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
                    var array = this.getSpellCastTurn(spell.spellId);
                    if (array.length == 0) {
                        result = true;
                    } else {
                        if (spell.maxCastPerTurn > 0 && array.length >= spell.maxCastPerTurn) {
                            result = false;
                        } else {
                            var target = this.actor.fight.getFighterOnCell(cell);
                            if (target == null) {
                                result = true;
                            } else {
                                var count = this.getSpellPerTarget(target);
                                console.log(count);
                                
                                result = true;
                                /*if (spell.maxCastPerTarget <= 0 || count < spell.maxCastPerTarget) {
                                    result = true;
                                } else {
                                    result = false;
                                }*/
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    getLastSpell(spellId) {
        if (this.spellStack == null || this.spellStack.length == 0) {
            return null;
        } else {
            for (var i = (this.spellStack.length - 1); i >= 0; i--) {
                return this.spellStack[i];
            }
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
                result.push(i);
            }
        }

        return result;
    }
}