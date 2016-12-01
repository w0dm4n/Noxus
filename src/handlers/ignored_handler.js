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


export default class IgnoredHandler {
    static isIgnoring(client, character)
    {
        for (var i in client.character.ignoredsList)
        {
            if (client.character.ignoredsList[i] == character._id)
                return true;
        }
        return false;
    }

    static isIgnoringForSession(client, character)
    {
        for (var i in client.character.ignoredForSession)
        {
            if (client.character.ignoredForSession[i] == character._id)
                return true;
        }
        return false;
    }

    static handleIgnoredAddRequestMessage(client, packet)
    {
        var target = WorldServer.getOnlineClientByCharacterName(packet.name);
        if (target == null)
            target = WorldServer.getOnlineClientByNickName(packet.name);
        if (target)
        {
            if (packet.session == true) {
                if (!IgnoredHandler.isIgnoringForSession(client, target.character)) {
                    client.character.ignoredForSession.push(target.character._id);
                    client.send(new Messages.IgnoredAddedMessage(new Types.IgnoredOnlineInformations(target.account.uid, target.account.nickname, target.character._id,
                        target.character.name, target.character.breed, target.character.sex), true));
                }
                else
                    client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.ALREADY_FRIEND));
            }
            else
            {
                // ennemis
            }
        }
        else
            client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.CHARACTER_NOT_FOUND));
    }

    static sendIgnoredList(client)
    {
        var list = client.character.ignoredsList;
        var sendList = [];
        for (var i in list)
        {
            var target = WorldServer.getOnlineClientByCharacterId(list[i]);
            if (target)
            {
                sendList.push(new Types.IgnoredOnlineInformations(target.account.uid, target.account.nickname, target.character._id,
                    target.character.name, target.character.breed, target.character.sex));
            }
        }
        client.send(new Messages.IgnoredListMessage(sendList));
    }

    static handleIgnoredGetListMessage(client, packet)
    {
        IgnoredHandler.sendIgnoredList(client);
    }

    static handleIgnoredDeleteRequestMessage(client, packet) {
        if (packet.session == true) {
            var target = WorldServer.getOnlineCharacterByAccountId(packet.accountId);
            if (target) {
                if (IgnoredHandler.isIgnoringForSession(client, target)) {
                    var index = client.character.ignoredForSession.indexOf(target.client.character._id);
                    if (index != -1)
                        client.character.ignoredForSession.splice(index, 1);
                        client.send(new Messages.IgnoredDeleteResultMessage(true, target.client.account.nickname, true));
                }
                else {
                    client.character.replyError("Impossible car vous n'ignorez pas ce joueur !");
                }
            }
            else
                client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.CHARACTER_NOT_FOUND));
        }
        else
        {
            // ennemis
        }
    }
}