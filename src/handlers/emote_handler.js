import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import Datacenter from "../database/datacenter"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import PlayableBreedEnum from "../enums/playable_breed_enum"
import Character from "../database/models/character"
import WorldManager from "../managers/world_manager"
import CharacterManager from "../managers/character_manager.js"
import Loader from "../managers/loader_manager"
import FriendHandler from "../handlers/friend_handler"

export default class EmoteHandler {

    static getAllEmotes()
    {
        var objects = Datacenter.emotes;
        var emotes = [];

        for (var i of objects)
            emotes.push(i._id);
        return emotes;
    }

    static getEmoteById(id)
    {
        var emotes = Datacenter.emotes;
        for(var i in emotes){
            if (emotes[i]._id == id)
                return emotes[i];
        }
        return null;
    }

    static haveEmote(client, id)
    {
        var emotes = client.character.emotes;
        for(var i in emotes) {
            if (emotes[i] == id)
                return true;
        }
        return false;
    }

    static handleEmotePlayRequestMessage(client, packet){
        if (EmoteHandler.haveEmote(client, packet.emoteId))
        {
            var time = Date.now || function () { return +new Date; };
            client.character.getMap().send(new Messages.EmotePlayMessage(packet.emoteId, time(), client.character._id, client.account.uid));
        }
    }
}