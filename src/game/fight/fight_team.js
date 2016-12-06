import Fighter from "./fighter"
import Basic from "../../utils/basic"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"

export default class FightTeam {

    constructor(fight, id, leader) {
        this.fight = fight;
        this.teamType = 0;
        this.id = id;
        this.leader = leader;
        this.restrictions = {isSecret: false, locked: false, onlyParty: false, isAskingForHelp: false};
        this.members = [];
        this.addMember(this.leader);
        this.placementCells = [];
        this.bladeCellId = leader.character.cellid;
    }

    addMember(fighter) {
        fighter.team = this;
        this.members.push(fighter);
    }

    removeMember(fighter) {
        fighter.team = null;
        if(this.members.indexOf(fighter) != -1)
            this.members.splice(this.members.indexOf(fighter), 1);
    }

    getAliveMembers() {
        var fighters = [];
        for(var f of this.members) {
            if(f.alive) fighters.push(f);
        }
        return fighters;
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

    isInThisTeam(fighterId) {
        for(var f of this.members) {
            if(f.character._id == fighterId) return true;
        }
        return false;
    }

    getFightTeamInformations() {
        var fighters = [];
        for(var f of this.members) {
            fighters.push(f.getFightTeamMemberCharacterInformations());
        }
        return new Types.FightTeamInformations(this.id, this.leader.character._id, this.id, this.teamType, 0, fighters);
    }

    getFightOptionsInformations() {
        return new Types.FightOptionsInformations(this.restrictions.isSecret, this.restrictions.onlyParty, this.restrictions.locked, this.restrictions.isAskingForHelp);
    }
}