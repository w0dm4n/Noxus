import PartyType from "../../enums/party_type"
import Logger from "../../io/logger"
import WorldServer from "../../network/world"
import Datacenter from "../../database/datacenter"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"

export default class Party {
    id = 0;
    leader = null;
    partyType = null;
    members = null;
    name = null;
    max_members = 0;
    constructor(partyType, characterLeader)
    {
        this.id = Math.floor(new Date().valueOf() / 1000);
        this.leader = characterLeader;
        this.partyType = partyType;
        this.members = [];
        this.name = "";
        this.max_members = 8;

        Logger.debug("New party with id " + this.id + " added of type " + this.partyType + " with leader " + this.leader.name);
        this.addMember(characterLeader, false);
        WorldServer.partys.push(this);
    }

    dispose()
    {
        for (var i in this.members) {
            if (this.members[i] != null) {
                this.members[i].party = null;
                this.members[i].invitation = null;
            }
        }

        var index = WorldServer.partys.indexOf(this);
        if (index != -1)
            WorldServer.partys.splice(index, 1);
        Logger.debug("Party deleted with id " + this.id + ", leader: " + this.leader.name);
    }

    sendToParty(message){
        for (var i in this.members) {
            if (this.members[i] != null && this.members[i].client != null) {
                try { this.members[i].client.send(message); } catch (error) { Logger.error(error); }
            }
        }
    }

    sendToPartyExcept(message, character) {
        for (var i in this.members) {
            if ((this.members[i] != null && this.members[i].client != null) && this.members[i]._id != character._id) {
                try { this.members[i].client.send(message); } catch (error) { Logger.error(error); }
            }
        }
    }

    removeFromMembers(character, isOnDisconnect)
    {
        for (var i in this.members)
        {
            if (this.members[i]._id == character._id)
            {
                if ((this.members[i] != null && this.members[i].client != null) && !isOnDisconnect) {
                    try {
                        this.members[i].client.send(new Messages.PartyLeaveMessage(this.id));
                    }
                    catch (error)
                    {
                        Logger.error(error);
                    }
                    this.members[i].party = null;
                    this.members[i].invitation = null;
                }
                var index = this.members.indexOf(this.members[i]);
                if (index != -1)
                    this.members.splice(index, 1);
                return;
            }
        }
    }
    removeGuest(character)
    {
        for (var i in this.members)
        {
            if (this.members[i]._id == character._id)
            {
                var index = this.members.indexOf(this.members[i]);
                if (index != -1)
                    this.members.splice(index, 1);
            }
        }
    }

    addMember(character, isGuest) {
        this.removeGuest(character);
        var membersPartyInformations = [];
        this.members.push(character);
        for (var i in this.members) {
            if (isGuest && this.members[i] == character)
                membersPartyInformations.push(this.members[i].getPartyGuestInformations());
            else
                membersPartyInformations.push(this.members[i].getPartyInformations());
        }

        if (!isGuest)
            this.sendToParty(new Messages.PartyNewMemberMessage(this.id, character.getPartyInformations()));
        else {
            this.sendToPartyExcept(new Messages.PartyNewGuestMessage(this.id, character.getPartyGuestInformations()), character);
        }
        if (!isGuest)
            character.client.send(new Messages.PartyJoinMessage(this.id, this.partyType, this.leader._id, this.max_members, membersPartyInformations, [], 0, this.name));
    }

    removeMember(character, isOnDisconnect)
    {
        if (this.members.length > 2) {
            this.removeFromMembers(character, isOnDisconnect);
            if (this.isLeader(character)) {
                this.assignNewLeader();
            }
            if (!isOnDisconnect)
                this.sendToParty(new Messages.PartyMemberRemoveMessage(this.id, character._id));
            else {
                this.sendToPartyExcept(new Messages.PartyMemberRemoveMessage(this.id, character._id), character);
            }
        }
        else
        {
            if (!isOnDisconnect)
                this.sendToParty(new Messages.PartyLeaveMessage(this.id));
            else
                this.sendToPartyExcept(new Messages.PartyLeaveMessage(this.id), character);
            this.dispose();
        }
    }

    isInParty(character) {
        for (var i in this.members)
        {
            if (this.members[i]._id == character._id)
                return true;
        }
        return false;
    }

     isLeader(character){
        return (this.leader._id == character._id) ? true : false;
    }

    assignNewLeader() {
        var oldLeader = this.leader;
        for (var i in this.members)
        {
            this.leader = this.members[i];
            break;
        }
        this.sendToPartyExcept(new Messages.PartyLeaderUpdateMessage(this.id, this.leader._id), oldLeader);
    }
}



