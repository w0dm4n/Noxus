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
 
 
export default class FriendHandler {
     
        static isAlreadyFriend(client, friendAccount)
        {
            for (var i in client.account.friends)
            {
                if (client.account.friends[i].friendAccountId == friendAccount.uid)
                    return true;
            }
            return false;
        }
 
        static sendNewFriend(client, target)
        {
            var friendsList = new Array();
             
            var state = PlayerStateEnum.UNKNOWN_STATE;
            if (target.account.friends)
                if (FriendHandler.isAlreadyFriend(target, client.account))
                    state = PlayerStateEnum.GAME_TYPE_ROLEPLAY;
            var friendInformations = new Types.FriendOnlineInformations(target.account.uid,
             target.account.nickname, state, 0, 0, target.character._id, 
                target.character.name, target.character.level, 0, target.character.breed, target.character.sex, new Types.GuildInformations(0, "", 0, new Types.GuildEmblem(0, 0, 0, 0)), 0,
             new Types.PlayerStatus(state));
 
            friendsList.push(friendInformations);
 
            client.send(new Messages.FriendsListMessage(friendsList));
        }
 
        static handleFriendAddRequestMessage(client, packet)
        {
            if (packet.name)
            {
                var target = WorldServer.getOnlineClientByCharacterName(packet.name);
                if (target == null)
                    target = WorldServer.getOnlineClientByNickName(packet.name);
                 
                if (target)
                {
                    if (!FriendHandler.isAlreadyFriend(client, target.account))
                    {
                        var friend = new AccountFriend({_id: 0, accountId: client.account.uid, friendAccountId: target.account.uid});
                        DBManager.createFriend(friend, function(friend){
                            client.account.friends.push(friend);
                            FriendHandler.sendNewFriend(client, target);
                        });
                    }
                    else
                        client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.ALREADY_FRIEND));
                }
                else
                    client.send(new Messages.FriendAddFailureMessage(FriendFailureEnum.CHARACTER_NOT_FOUND));
            }
        }
 
        static sendFriendsList(client)
        {
            var friendsList = new Array();
            if (client.account.friends)
            {
                for (var i in client.account.friends)
                {
                    var friendCharacter = WorldServer.getOnlineCharacterByAccountId(client.account.friends[i].friendAccountId);
                    if (friendCharacter)
                    {
                        var state = PlayerStateEnum.UNKNOWN_STATE;
                        var typeState = 1;
                        var level = 0;
                        if (friendCharacter.client.account.friends)
                        {
                            if (FriendHandler.isAlreadyFriend(friendCharacter.client, client.account))
                            {
                                state = PlayerStateEnum.GAME_TYPE_ROLEPLAY;
                                level = friendCharacter.level;
                                typeState = 10; // button green connected
                            }
                            else
                                level = 0;
                        }
                        friendsList.push(new Types.FriendOnlineInformations(friendCharacter.client.account.uid,
                        friendCharacter.client.account.nickname, state, 0, 0, friendCharacter._id, 
                        friendCharacter.name, level, 0, friendCharacter.breed, friendCharacter.sex, new Types.GuildInformations(0, "", 0, new Types.GuildEmblem(0, 0, 0, 0))
                        , 0, new Types.PlayerStatus(typeState)));
                    }
                }
 
                client.send(new Messages.FriendsListMessage(friendsList));
            }
        }
 
        static handleFriendsGetListMessage(client, packet)
        {
            FriendHandler.sendFriendsList(client);
        }
 
        static getFriendByAccountId(client, accountId)
        {
            for (var i in client.account.friends)
            {
                if (client.account.friends[i].friendAccountId == accountId)
                    return client.account.friends[i];
            }
        }
 
        static handleFriendDeleteRequestMessage(client, packet)
        {
            if (client.account.friends)
            {
                DBManager.getAccount({uid: packet.accountId}, function(friendAccount)
                    {
                        if (friendAccount)
                        {
                            if (FriendHandler.isAlreadyFriend(client, friendAccount))
                            {
                                var friend = FriendHandler.getFriendByAccountId(client, friendAccount.uid);
                                if (friend)
                                {
                                    var index = client.account.friends.indexOf(friend);
                                    if (index != -1)
                                         client.account.friends.splice(index, 1);
 
                                    DBManager.removeFriend({friendAccountId: friendAccount.uid}, function(result)
                                    {
                                        if (result)
                                            FriendHandler.sendFriendsList(client);
                                    });
                                }                   
                            }
                        }
                    });
            }
        }

        static sendFriendsOnlineMessage(client)
        {
            if (client.character.friendsOnline > 0)
                client.character.replyText("Vous avez " + client.character.friendsOnline + " <b>ami(s)</b> en ligne.");
        }

        static sendFriendDisconnect(client)
        {
            if (client.account.friends)
            {
                 for (var i in client.account.friends)
                {
                    var character = WorldServer.getOnlineCharacterByAccountId(client.account.friends[i].friendAccountId);
                    if (character)
                    {
                        FriendHandler.sendFriendsList(character.client);
                    }
                }
            }
        }
}