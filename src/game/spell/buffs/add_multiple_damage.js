import Buff from "../buff"
import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class MultipleDamage extends Buff {

    static displayId = 1163;

    constructor(delta,spell, spellLevel, effect, caster, fighter) {
        super(effect, spell, spellLevel, caster, fighter);
        this.delta = delta;
    }

    apply() {

     this.fighter.multipleDamage = this.delta;   
     }

    unapply() {
        this.fighter.multipleDamage = 0;
     }

    show() {
        this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(MultipleDamage.displayId, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    hide() {
        //this.fighter.fight.send(new Messages.GameActionFightDispellSpellMessage(951, this.fighter.id, this.fighter.id, this.spell.spellId));
    }

    getAbstractFightDispellableEffect() {
        return new Types.FightTemporaryBoostStateEffect(this.id, this.fighter.id, this.duration, 1, this.spell.spellId, this.effectId, 16, 0, this.delta);
    }

}
