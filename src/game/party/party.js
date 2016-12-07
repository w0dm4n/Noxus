import PartyType from "../../enums/party_type"
import Logger from "../../io/logger"
import WorldServer from "../../network/world"
import Datacenter from "../../database/datacenter"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import PartyFollower from "../../game/party/party_follower"
import CompassEnum from "../../enums/compass_type_enum"

export default class Party {
    id = 0;
    leader = null;
    partyType = null;
    members = null;
    name = null;
    max_members = 0;
    followers = [];
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

    getDetails(character, inviter)
    {
        var members = [];
        for (var i in this.members)
        {
            if (this.members[i] && this.members[i].client)
            {
                members.push(this.members[i].getPartyInvitationMemberInformations());
            }
        }
        character.client.send(new Messages.PartyInvitationDetailsMessage(this.id, this.partyType, this.name, inviter._id, inviter.name, this.leader._id, members, []));
    }

    removeMember(character, isOnDisconnect)
    {
        this.warnFollowers(character);
        if (this.isFollower(character))
        {
            var followeds = this.getFollowersFromFollower(character);
            if (followeds.length > 0)
                this.sendCompassUpdate(character, followeds);
        }
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

    sendCompassUpdate(character, followeds) {
        for (var i in followeds) {
            try {
                followeds[i].replyLangsMessage(0, 53, [character.name]);
                character.client.send(new Messages.PartyFollowStatusUpdateMessage(this.id, true, false, followeds[i]._id));
            }
            catch (error) { Logger.error(error); }
            try {
                character.client.send(new Messages.CompassUpdatePartyMemberMessage(CompassEnum.TYPE_PARTY, followeds[i].getMapCoordinates(), followeds[i]._id, false));
            } catch (error) {
                Logger.error(error);
            }
        }
    }

    warnFollowers(character)
    {
        try
        {
            var followers = this.getFollowers(character);
            if (followers.length > 0)
            {
                for (var i in followers) {
                    this.sendCompassUpdate(followers[i].follower, [character]);
                }
            }
        }
        catch (error)
        {
            Logger.error(error);
        }
    }

    isFollower(character)
    {
        for (var i in this.followers)
        {
            if (this.followers[i].follower._id == character._id)
                return true;
        }
        return false;
    }

    getFollowersFromFollower(character)
    {
        var followed = [];
        for (var i in this.followers)
        {
            if (this.followers[i].follower._id == character._id)
                followed.push(this.followers[i].followed);
        }
        return followed;
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

    setLeader(character)
    {
        this.leader = character;
        this.sendToParty(new Messages.PartyLeaderUpdateMessage(this.id, this.leader._id));
    }

    setAsFollower(follower, followed)
    {
        this.followers.push(new PartyFollower(follower, followed));
        follower.client.send(new Messages.PartyFollowStatusUpdateMessage(this.id, true, true, followed._id));
        follower.client.send(new Messages.CompassUpdatePartyMemberMessage(CompassEnum.TYPE_PARTY, followed.getMapCoordinates(), followed._id, true));
        follower.replyLangsMessage(0, 368, [followed.name]);
        followed.replyLangsMessage(0, 52, [follower.name]);
    }

    isFollowing(follower, followed) {
         var followers = this.followers;
         for (var i in followers)
         {
             if (followers[i].follower._id == follower._id
             && followers[i].followed._id == followed._id)
             {
                 var index = this.followers.indexOf(followers[i]);
                 if (index != -1)
                     this.followers.splice(index, 1);
                 return true;
             }
         }
         return false;
    }

    getFollowers(followed)
    {
        var followers = [];
        for (var i in this.followers) {
            if (this.followers[i].followed._id == followed._id)
                followers.push(this.followers[i]);
        }
        return followers;
    }

    stopFollowing(follower, followed)
    {
        if (this.isFollowing(follower, followed))
        {
            followed.replyLangsMessage(0, 53, [follower.name]);
            follower.client.send(new Messages.PartyFollowStatusUpdateMessage(this.id, true, false, followed._id));
            follower.client.send(new Messages.CompassUpdatePartyMemberMessage(CompassEnum.TYPE_PARTY, followed.getMapCoordinates(), followed._id, false));
        }
    }

    sendPositionToFollowers(followed)
    {
        var followers = this.getFollowers(followed);
        if (followers.length > 0)
        {
            for (var i in followers)
            {
                try { followers[i].follower.client.send(new Messages.CompassUpdatePartyMemberMessage(CompassEnum.TYPE_PARTY, followed.getMapCoordinates(), followed._id, true)); } catch (error) { Logger.error(error); }
            }
        }
    }
}




