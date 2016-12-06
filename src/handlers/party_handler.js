import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import PlayableBreedEnum from "../enums/playable_breed_enum"
import Character from "../database/models/character"
import WorldManager from "../managers/world_manager"
import AccountFriend from "../database/models/account_friend"
import FriendFailureEnum from "../enums/friend_failure_enum"
import PlayerStateEnum from "../enums/player_state_enum"
import AccountIgnored from "../database/models/account_ignored"
import FriendHandler from "../handlers/friend_handler"
import IgnoredHandler from "../handlers/ignored_handler"
import PartyFriend from "../game/party/party_friend"
import PartyType from "../enums/party_type"
import PartyInvitation from "../game/party/party_invitation"


export default class PartyHandler {
    static handlePartyInvitationRequestMessage(client, packet) {
        if (packet.name && packet.name.length > 0) {
            var target = WorldServer.getOnlineClientByCharacterName(packet.name);
            if (target)
            {
                if (!IgnoredHandler.isIgnoringForSession(target, client.character) && !IgnoredHandler.isIgnoring(target, client.account)) {
                        try {
                            if (client.character.party == null)
                                client.character.party = new PartyFriend(client.character);
                            target.character.invitation = new PartyInvitation(client.character.party, client.character, target.character);
                            target.character.invitation.showInvitation();
                        }
                        catch (error) {
                            Logger.error(error);
                        }
                }
                else
                    client.character.replyLangsMessage(1, 370, [target.character.name]);
            }
            else
                client.character.replyImportant("Impossible de trouver ce personnage.");
        }
    }

    static getPartyById(id)
    {
        var partys = WorldServer.partys;
        for (var i in partys)
        {
            if (partys[i].id == id)
                return partys[i];
        }
        return null;
    }

    static handlePartyRefuseInvitationMessage(client, packet)
    {
        if (client.character.invitation)
        {
            client.character.invitation.declineInvitation();
        }
    }

    static handlePartyAcceptInvitationMessage(client, packet) {
        if (client.character.invitation)
        {
            client.character.invitation.acceptInvitation();
        }
    }

    static handlePartyLeaveRequestMessage(client, packet) {
        if (packet.partyId >= 0)
        {
            var party = WorldServer.getPartyById(packet.partyId);
            if (party)
            {
                if (party.isInParty(client.character))
                {
                    party.removeMember(client.character, false);
                }
                else
                    client.character.replyImportant("Impossible car vous ne faites pas partis de ce groupe.");
            }
            else
                client.character.replyImportant("Impossible de trouver ce groupe.");
        }
    }

    static handlePartyKickRequestMessage(client, packet)
    {
        if (client.character.party && WorldServer.getPartyById(client.character.party.id)
        && client.character.party.isInParty(client.character))
        {
            if (packet.partyId == client.character.party.id)
            {
                if (client.character.party.isLeader(client.character))
                {
                    var target = WorldServer.getOnlineClientByCharacterId(packet.playerId);
                    if (target) {
                        client.character.party.removeMember(target.character, false);
                        target.character.replyImportant("Vous avez été exclu du groupe.");
                    }
                }
                else
                    client.character.replyImportant("Impossible car vous n'êtes pas le chef du groupe.")
            }
            else
                client.character.replyError("Une erreur est survenu, le groupe est invalide.");
        }
        else
            client.character.replyImportant("Impossible car vous n'êtes pas dans un groupe.");
    }
}