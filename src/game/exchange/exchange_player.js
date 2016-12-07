import PartyType from "../../enums/party_type"
import Logger from "../../io/logger"
import WorldServer from "../../network/world"
import Datacenter from "../../database/datacenter"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import PartyFollower from "../../game/party/party_follower"
import CompassEnum from "../../enums/compass_type_enum"
import ExchangeType from "../../enums/exchange_type_enum"
import Exchange from "./exchange"

export default class ExchangePlayer {

    type = 0;
    firstActor = null;
    secondActor = null;

    constructor(type, firstActor, secondActor)
    {
        this.type = type;
        this.firstActor = firstActor;
        this.secondActor = secondActor;
        this.sendRequest();
    }

    sendRequest()
    {
        this.firstActor.send(new Messages.ExchangeRequestedTradeMessage(this.type, this.firstActor._id, this.secondActor._id));
    }

}