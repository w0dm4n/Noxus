import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import ChatChannel from "../enums/chat_activable_channels_enum"
import Character from "../database/models/character"
import AccountRole from "../enums/account_role_enum"
import Common from "../Common"
import WorldManager from "../managers/world_manager"

export default class LoaderManager {

    static LoadAccountData(client, callback)
    {
        try
        {
            client.account.friends = new Array();

            DBManager.getFriends({accountId: client.account.uid}, function(friends){
                for (var i in friends)
                    client.account.friends.push(friends[i++]);
                Logger.infos("Account data successfully loaded for account " + client.account.username + " (" + client.account.uid + ")");
                callback();
            });
        }
        catch (error)
        {
            Logger.error("Can't load account data for " + client.account.username + ", error :" + error);
            client.close();
        }
    }

    static LoadCharacterData(client, callback)
    {
        callback();
    }

}