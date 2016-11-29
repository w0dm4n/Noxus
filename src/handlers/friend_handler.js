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
            /*
            new FriendOnlineInformations(character.AccountId, account.Username, (sbyte)PlayerStateEnum.UNKNOWN_STATE,
                                (ushort)character.LastConnection, 0,
                                 (uint)character.Id, character.Name, 0, 0, character.Breed, character.Sex, new BasicGuildInformations(0, "-"), 0, statusPlayer)
                                */
            // var friendInformations = new Types.FriendInformations(target.account.uid, target.account.nickname, PlayerStateEnum.NOT_CONNECTED, 0, 0);
            var friendsList = new Array();
            var guildInformation = new Types.GuildInformations(0, "", 0, new Types.GuildEmblem(0, 0, 0, 0));
            var friendInformations = new Types.FriendOnlineInformations(target.account.uid,
             target.account.nickname, PlayerStateEnum.GAME_TYPE_ROLEPLAY, 0, 0, target.character._id, 
                target.character.name, target.character.level, 0, target.character.breed, target.character.sex, guildInformation, 0,
             new Types.PlayerStatus(PlayerStateEnum.GAME_TYPE_ROLEPLAY));
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
            //var friend = new AccountFriend({_id: 0, accountId: client.account.uid, friendAccountId: 666});
            /*DBManager.createFriend(friend, function(friend){
                client.character.replyText("Friend ID: " + friend._id);
            });*/
        }
}