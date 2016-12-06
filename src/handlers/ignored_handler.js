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


export default class IgnoredHandler {

    static isIgnoringForSession(client, character)
    {
        for (var i in client.character.ignoredForSession)
        {
            if (client.character.ignoredForSession[i] == character._id)
                return true;
        }
        return false;
    }

    static isIgnoring(client, ignoredAccount)
    {
        for (var i in client.account.ignoredsList)
        {
            if (client.account.ignoredsList[i].ignoredAccountId == ignoredAccount.uid)
                return true;
        }
        return false;
    }

    static handleIgnoredAddRequestMessage(client, packet)
    {
        if (packet.name && packet.name.length > 0) {
            if (packet.name.toLowerCase() == client.character.name.toLowerCase() ||
                packet.name.toLowerCase() == client.account.nickname.toLowerCase()) {
                client.character.replyText("Impossible de vous ajouter vous-même à votre liste.");
                return;
            }
            var target = WorldServer.getOnlineClientByCharacterName(packet.name);
            if (target == null)
                target = WorldServer.getOnlineClientByNickName(packet.name);
            if (target) {
                if (packet.session == true) {
                    if (!IgnoredHandler.isIgnoringForSession(client, target.character)) {
                        client.character.ignoredForSession.push(target.character._id);
                        client.send(new Messages.IgnoredAddedMessage(new Types.IgnoredOnlineInformations(target.account.uid, target.account.nickname, target.character._id,
                            target.character.name, target.character.breed, target.character.sex), true));
                    }
                    else
                        client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.ALREADY_FRIEND));
                }
                else {
                    if (FriendHandler.isAlreadyFriend(client, target.account)) {
                        client.character.replyImportant("Impossible d'ajouter en ennemi quelqu'un de votre liste d'amis.");
                        return;
                    }
                    if (!IgnoredHandler.isIgnoring(client, target.account)) {
                        var ignored = new AccountIgnored({
                            _id: 0,
                            accountId: client.account.uid,
                            ignoredAccountId: target.account.uid
                        });

                        DBManager.createIgnored(ignored, function (ignored) {
                            client.account.ignoredsList.push(ignored);
                            IgnoredHandler.sendIgnoredList(client);
                        });
                    }
                    else
                        client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.ALREADY_FRIEND));
                }
            }
            else
                client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.CHARACTER_NOT_FOUND));
        }
    }

    static sendIgnoredList(client)
    {
        if (client.account.ignoredsList) {
            var list = client.account.ignoredsList;
            var sendList = [];
            for (var i in list) {
                var target = WorldServer.getOnlineCharacterByAccountId(list[i].ignoredAccountId);
                if (target) {
                    sendList.push(new Types.IgnoredOnlineInformations(target.client.account.uid, target.client.account.nickname, target.client.character._id,
                        target.client.character.name, target.client.character.breed, target.client.character.sex));
                }
                else {
                    if (list[i].account) {
                        sendList.push(new Types.IgnoredInformations(list[i].account.uid, list[i].account.nickname));
                    }
                }
            }
            client.send(new Messages.IgnoredListMessage(sendList));
        }
    }

    static handleIgnoredGetListMessage(client, packet)
    {
        IgnoredHandler.sendIgnoredList(client);
    }

    static getIgnoredByAccountId(client, accountId)
    {
        for (var i in client.account.ignoredsList)
        {
            if (client.account.ignoredsList[i].ignoredAccountId == accountId)
                return client.account.ignoredsList[i];
        }
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
            DBManager.getAccount({uid: packet.accountId}, function(ignoredAccount)
            {
                if (ignoredAccount)
                {
                    if (IgnoredHandler.isIgnoring(client, ignoredAccount))
                    {
                        var ignored = IgnoredHandler.getIgnoredByAccountId(client, ignoredAccount.uid);
                        if (ignored)
                        {
                            var index = client.account.ignoredsList.indexOf(ignored);
                            if (index != -1)
                                client.account.ignoredsList.splice(index, 1);

                            DBManager.removeIgnored({accountId: client.account.uid, ignoredAccountId: ignoredAccount.uid}, function(result)
                            {
                                if (result)
                                    IgnoredHandler.sendIgnoredList(client);
                            });
                        }
                    }
                }
            });
        }
    }
}