export default class SpellHistoryInformation{

    constructor(spell,target , round){
        this.spell = spell;
        this.target = target;
        this.round = round;
    }

    getRound(current){
        return current - this.round;
    }

    getElapsedRoundSpell(current){
        return (this.getRound(current) - this.spell.minCastInterval);
    }
}