import PartyType from "../../enums/party_type"
import * as Messages from "../../io/dofus/messages"
import Logger from "../../io/logger"

export default class PartyInvitation {
    party = null;
    leader = null;
    invited = null;
    constructor(party, leader, invited)
    {
        this.party = party;
        this.leader = leader;
        this.invited = invited;
    }

    showInvitation()
    {
        this.party.addMember(this.invited, true);
        this.invited.client.send(new Messages.PartyInvitationMessage(this.party.id, this.party.partyType, "", this.party.members.length,
            this.leader._id, this.leader.name, this.invited._id));
    }

    declineInvitation(){
        this.invited.client.send(new Messages.PartyInvitationCancelledForGuestMessage(this.party.id, this.invited._id));
        if (this.party.members > 1) {
            this.party.sendToParty(new Messages.PartyRefuseInvitationNotificationMessage(this.party.id, this.invited._id));
        }
        else
        {
            this.leader.client.send(new Messages.PartyRefuseInvitationNotificationMessage(this.party.id, this.invited._id));
            this.party.sendToParty(new Messages.PartyLeaveMessage(this.party.id));
            this.party.dispose();
        }
        this.dispose();
    }

    acceptInvitation() {
        if (this.party) {
            if (this.invited.party != null) {
                // remove character from current party
            }
            this.dispose();
            this.invited.party = this.party;
            this.party.addMember(this.invited);
            Logger.debug("New member to party id " + this.party.id + ", player " + this.invited.name);
        }
    }

    dispose()
    {
        this.invited.invitation = null;
    }
}
