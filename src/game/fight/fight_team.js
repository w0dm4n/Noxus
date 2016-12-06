import Fighter from "./fighter"
import Basic from "../../utils/basic"

export default class FightTeam {

    constructor(fight, id, leader) {
        this.fight = fight;
        this.id = id;
        this.leader = leader;
        this.restrictions = {locked: false, onlyParty: false};
        this.members = [];
        this.addMember(this.leader);
        this.placementCells = [];
    }

    addMember(fighter) {
        fighter.team = this;
        this.members.push(fighter);
    }

    placeFighterOnAvailableCell(fighter) {
        var i = 0;
        while(fighter.cellId == -1) {
            i++;
            var cellId = this.placementCells[Basic.getRandomInt(0, this.placementCells.length)];
            if(!this.fight.getFighterOnCell(cellId)) {
                fighter.cellId = cellId;
            }
            if(i > 666) return;
        }
    }
}