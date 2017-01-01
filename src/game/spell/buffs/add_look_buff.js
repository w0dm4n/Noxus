import Buff from "../buff"
import * as Messages from "../../../io/dofus/messages"
import * as Types from "../../../io/dofus/types"

export default class AddLookBuff extends Buff {

    static displayId = 149;

    constructor(delta, spell, spellLevel, effect, caster, fighter) {
        super(effect, spell, spellLevel, caster, fighter);
        this.delta = delta;
    }

    apply() {
        this.fighter.character.skinsLook = [];
        this.fighter.character.skinsLook.push(this.delta);
        this.fighter.fight.send(new Messages.GameActionFightChangeLookMessage(AddLookBuff.displayId,this.caster.id,this.fighter.id,this.fighter.character.getEntityLook()));
    }

    unapply() {
         this.fighter.character.skinsLook = [];
         this.fighter.fight.send(new Messages.GameActionFightChangeLookMessage(AddLookBuff.displayId,this.caster.id,this.fighter.id,this.fighter.character.getEntityLook()));       
    }

    show() {
        this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(AddLookBuff.displayId, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    getAbstractFightDispellableEffect() {
        return new Types.FightTemporaryBoostEffect(this.id, this.fighter.id, this.duration, 1, this.spell.spellId, AddLookBuff.displayId, 16, 0);
    }

}
