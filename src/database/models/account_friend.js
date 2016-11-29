import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import CharacterManager from "../../managers/character_manager.js"
import ChatRestrictionManager from "../../managers/chat_restriction_manager.js"
import WorldManager from "../../managers/world_manager.js"
import WorldServer from "../../network/world"
import Logger from "../../io/logger"
import ConfigManager from "../../utils/configmanager.js"
import DBManager from "../../database/dbmanager"

export default class AccountFriend {

    constructor(raw) {
        this._id = raw._id;
        this.accountId = raw.accountId;
        this.friendAccountId = raw.friendAccountId;
    }
}