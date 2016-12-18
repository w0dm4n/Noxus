import Buff from "../buff"
import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class RemoveMpBuff extends Buff {

    static displayId = 133;

    constructor(delta, spell, spellLevel, effect, caster, fighter) {
        super(effect, spell, spellLevel, caster, fighter);
        this.delta = delta;
    }

    apply() {

    }

    unapply() {
        this.fighter.refreshStats();
        this.fighter.checkIfIsDead();
    }

    show() {
        this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(169, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    getAbstractFightDispellableEffect() {
        return new Types.FightTemporaryBoostEffect(this.id, this.fighter.id, this.duration, 1, this.spell.spellId, this.effectId, 16, this.delta);
    }

}