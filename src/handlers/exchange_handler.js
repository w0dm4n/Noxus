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
import ExchangeManager from "../managers/exchange_manager"
import ExchangeType from "../enums/exchange_type_enum"


export default class ExchangeHandler {

    static handleExchangePlayerRequestMessage(client, packet)
    {
        var target = WorldServer.getOnlineClientByCharacterId(packet.target);
        if (target) {
            if (!IgnoredHandler.isIgnoringForSession(target, client.character) && !IgnoredHandler.isIgnoring(target, client.account)) {
                if (!target.character.isBusy()) {
                    var exchange = ExchangeManager.newExchange(packet.exchangeType, client, target);
                    if (exchange) {
                        client.character.exchange = exchange;
                    }
                }
                else
                    client.character.replyLangsMessage(1, 209, []);
            }
            else
                client.character.replyLangsMessage(1, 370, [target.character.name]);
        }
    }

}