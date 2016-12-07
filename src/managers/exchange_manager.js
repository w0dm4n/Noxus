import PartyType from "../enums/party_type"
import Logger from "../io/logger"
import WorldServer from "../network/world"
import Datacenter from "../database/datacenter"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import PartyFollower from "../game/party/party_follower"
import CompassEnum from "../enums/compass_type_enum"
import ExchangeType from "../enums/exchange_type_enum"

export default class ExchangeManager {

    exchangeAvailable = {
        1:require("../game/exchange_player"),
    };

    static newExchange(exchangeType, firstActor, secondActor)
    {
        if (this.exchangeAvailable[exchangeType])
        {
            return new this.exchangeAvailable[exchangeType](exchangeType, firstActor, secondActor);
        }
    }
}