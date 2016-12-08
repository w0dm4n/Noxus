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

    type = 11;
    firstActor = null;
    secondActor = null;

    constructor(type, firstActor, secondActor)
    {
        this.firstActor = firstActor;
        this.secondActor = secondActor;
        this.firstActor.setDialog(this);
        this.secondActor.setDialog(this);
        this.sendRequest();
    }

    sendRequest()
    {
        this.firstActor.client.send(new Messages.ExchangeRequestedTradeMessage(ExchangeType.PLAYER_TRADE, this.firstActor._id, this.secondActor._id));
        this.secondActor.client.send(new Messages.ExchangeRequestedTradeMessage(ExchangeType.PLAYER_TRADE, this.firstActor._id, this.secondActor._id));
    }

    close()
    {
        if (this.firstActor != null) {

            this.firstActor.closeDialog(this);
            this.firstActor.client.send(new Messages.ExchangeLeaveMessage(this.type, false));

            this.secondActor.closeDialog(this);
            this.secondActor.client.send(new Messages.ExchangeLeaveMessage(this.type, false));
        }
    }

    acceptExchange()
    {
        this.firstActor.client.send(new Messages.ExchangeStartedWithPodsMessage(ExchangeType.PLAYER_TRADE, this.firstActor._id, 0, 1000, this.secondActor._id, 0, 1000));
        this.secondActor.client.send(new Messages.ExchangeStartedWithPodsMessage(ExchangeType.PLAYER_TRADE, this.firstActor._id, 0, 1000, this.secondActor._id, 0, 1000));
    }
}

module.exports = ExchangePlayer;