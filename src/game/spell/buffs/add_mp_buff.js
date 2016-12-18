import Buff from "../buff"
import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class AddMPBuff extends Buff {

    static displayId = 133;

    constructor(delta, spell, spellLevel, effect, caster, fighter) {
        super(effect, spell, spellLevel, caster, fighter);
        this.delta = delta;
    }

    beginTurn() {
        if (this.fighter.isInvisible())
            this.fighter.current.MP += this.delta;
    }

    apply() {
        this.fighter.current.MP += this.delta;
    }

    unapply() {
        this.fighter.refreshStats();
        this.fighter.checkIfIsDead();
    }

    show() {
        if (this.fighter.isInvisible())
        {
            this.fighter.fight.sendExcept(new Messages.GameActionFightDispellableEffectMessage(128, this.caster.id, this.getAbstractFightDispellableEffect()), this.fighter);

            this.fighter.sequenceCount++;
            this.fighter.character.client.send(new Messages.SequenceStartMessage(1, this.fighter.id));
            this.fighter.character.client.send(new Messages.GameActionFightPointsVariationMessage(129, this.fighter.id, this.fighter.id, this.delta));
            this.fighter.character.client.send(new Messages.SequenceEndMessage(this.fighter.sequenceCount, this.fighter.id, 1));
        }
        else
            this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(128, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    getAbstractFightDispellableEffect() {
        return new Types.FightTemporaryBoostEffect(this.id, this.fighter.id, this.duration, 1, this.spell.spellId, 128, 16, this.delta);
    }

}
