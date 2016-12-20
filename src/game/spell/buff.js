import Logger from "../../io/logger"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"

export default class Buff {

    constructor(effect, spell, spellLevel, caster, fighter) {
        this.spell = spell;
        this.spellLevel = spellLevel;
        this.id = fighter.fight.incrementCacheValue("buffId");
        this.caster = caster;
        this.fighter = fighter;
        this.effectId = effect.effectId;
        this.duration = effect.duration;
        this.preshowed = false;
        this.delay = effect.delay;
        this.lifetime = 0;
        this.applied = false;
        this.expired = false;
        this.delta = 0;

        // Wrapper for monster spell
        if(!this.spell.spellId) this.spell.spellId = this.spell._id;
    }

    tryApply() {
        Logger.debug("Trying to apply the buff");
        if(this.lifetime >= this.delay) {
            this.applied = true;
            this.apply();
            this.show();
            Logger.debug("Buff id: " + this.effectId + " applied");
        }
        else {
            if(!this.preshowed) {
                this.preshow();
                this.preshowed = true;
            }
        }
    }

    preshow() {
        //To implement
    }

    apply() {
        Logger.debug("The apply for the buff id: " + this.buffId + " is not implemented");
    }

    beginTurn() {
        //To implement
    }

    show() {
        this.fighter.fight.send(new Messages.GameActionFightDispellableEffectMessage(this.effectId, this.caster.id, this.getAbstractFightDispellableEffect()));
    }

    getAbstractFightDispellableEffect() {
        return new Types.FightTemporaryBoostEffect(this.id, this.fighter.id, this.duration, 1, this.spell.spellId, this.effectId, 16, this.delta);
    }

    hide() {

    }

    isExpired() {
        return (this.lifetime - this.delay) >= this.duration;
    }

    continueLifetime() {
        this.lifetime++;
        if(!this.applied) {
            this.tryApply();
        }
        else {
            this.beginTurn();
        }
    }

    checkExpires() {
        if(this.isExpired()) {
            Logger.debug("Buff lifetime expired");
            this.expired = true;
            this.unapply();
            this.hide();
        }
    }

    unapply() {
        Logger.debug("The unapply for the buff id: " + this.buffId + " is not implemented");
    }
}