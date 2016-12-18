import Buff from "../buff"
import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class HealSpellBuff extends Buff {

    static displayId = 133;

    constructor(spellBoostedId, delta, spell, spellLevel, effect, caster, fighter) {
        super(effect, spell, spellLevel, caster, fighter);
        this.spellBoostedId = spellBoostedId;
        this.delta = delta;
        this.effect = effect;
    }

    apply() {
       // this.fighter.spellDamagesBoosts[this.spellBoostedId] = this.delta;
       this.fighter.heal(this.fighter,this.delta,0);
    }

    unapply() {
        //delete this.fighter.spellDamagesBoosts[this.spellBoostedId];
        this.fighter.refreshStats();
        this.fighter.checkIfIsDead();
    }

    preshow() {
        this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(this.effectId, this.caster.id,
            new Types.FightTriggeredEffect(this.effectId, this.fighter.id, this.duration, 1, this.spellBoostedId, 0, 0, 0, 0, this.delta, this.delay)));
    }

    show() {
        //this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(this.effectId, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    getAbstractFightDispellableEffect() {
        //return new Types.FightTemporarySpellBoostEffect(this.id, this.fighter.id, this.duration, 1, this.spellBoostedId, this.effectId, this.delta, this.delta, this.spellBoostedId);
    }
}