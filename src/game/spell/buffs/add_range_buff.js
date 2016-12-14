import Buff from "../buff"
import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class AddRangeBuff extends Buff {

    static displayId = 133;

    constructor(delta, spell, spellLevel, effect, caster, fighter) {
        super(effect, spell, spellLevel, caster, fighter);
        this.delta = delta;
    }

    apply() {
        this.fighter.fightStatsBonus[19] += this.delta;
        this.fighter.refreshStats();
    }

    unapply() {
        this.fighter.fightStatsBonus[19] -= this.delta;
        this.fighter.refreshStats();
        this.fighter.checkIfIsDead();
    }

    show() {
        this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(117, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    getAbstractFightDispellableEffect() {
        return new Types.FightTemporaryBoostEffect(this.id, this.fighter.id, this.duration, 1, this.spell.spellId, 117, 16, this.delta);
    }

}
