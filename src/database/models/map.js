import Logger from "../../io/logger"
import Datacenter from "../../database/datacenter"
import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import DataMapProvider from "../../game/pathfinding/data_map_provider"
import ConfigManager from "../../utils/configmanager.js"
import InteractiveHandler from "../../handlers/interactive_handler"

var zlib = require('zlib');

export default class Map {

    static MAP_DECRYPT_KEY = "649ae451ca33ec53bbcbcc33becf15f4";

    clients = [];

    constructor(raw) {
        this._id = raw._id;
        this.subareaId = raw.subareaId;
        this.topNeighbourId = raw.topNeighbourId;
        this.bottomNeighbourId = raw.bottomNeighbourId;
        this.leftNeighbourId = raw.leftNeighbourId;
        this.rightNeighbourId = raw.rightNeighbourId;
        this.cellsRaw = raw.cells;
        this.dataMapProvider = new DataMapProvider(this);
        this.fights = [];
    }

    init() {
        this.cells = JSON.parse(zlib.inflateSync(new Buffer(this.cellsRaw, 'base64')).toString());
        this.zaap = this.getZaap(); 
    }

    getAvailableCells() {
        var aCells = [];
        for(var cell of this.cells) {
            if(cell._mov) {
                aCells.push(cell);
            }
        }
        return aCells;
    }

    addClient(client) {
        Logger.debug("Add new player in the mapId: " + this._id);    
        this.send(new Messages.GameRolePlayShowActorMessage(client.character.getGameRolePlayCharacterInformations(client.account)));
        this.clients.push(client);
        client.send(new Messages.CurrentMapMessage(this._id, Map.MAP_DECRYPT_KEY));
        InteractiveHandler.checkIfCharacterHaveZaap(client, this);
    }

    removeClient(client) {
        var index = this.clients.indexOf(client);
        if(index != -1) {
            this.clients.splice(index, 1);
            this.send(new Messages.GameContextRemoveElementMessage(client.character._id));
        }
    }

    getMapActors() {
        var actors = [];
        for(var i in this.clients) {
            actors.push(this.clients[i].character.getGameRolePlayCharacterInformations(this.clients[i].account));
        }
        return actors;
    }

    getClientByCharacterId(characterId) {
        for(var client of this.clients) {
            if(client.character) {
                if(client.character._id == characterId) return client;
            }
        }
        return null;
    }

    getFightById(fightId) {
        for(var fight of this.fights) {
            if(fight.id == fightId) return fight;
        }
        return null;
    }

    sendComplementaryInformations(client) {
            var Interactives = Datacenter.getInteractivesMap(this._id);
            var result = new Array();
            if(Interactives != null)
            {
                for(var i  in Interactives)
                {
                    result.push(new Types.InteractiveElement(Interactives[i].elementId,Interactives[i].elementTypeId,[new Types.InteractiveElementSkill(Interactives[i].skillId,1)],[],true));
                }
            }
        client.send(new Messages.MapComplementaryInformationsDataMessage(this.subareaId, this._id, [], this.getMapActors(),result, [], [], [], false));
    }

    send(packet) {
        for(var i in this.clients) {
            this.clients[i].send(packet);
        }
    }

    getZaap() {
        for (var i in Datacenter.interactivesObjects) {

            if (Datacenter.interactivesObjects[i].mapId == this._id && Datacenter.interactivesObjects[i].actionType == "Zaap")
                return Datacenter.interactivesObjects[i];
        }
        return null;
    }
    getZaapi() {
        for (var i in Datacenter.interactivesObjects) {

            if (Datacenter.interactivesObjects[i].mapId == this._id && Datacenter.interactivesObjects[i].actionType == "Zaapi")
                return Datacenter.interactivesObjects[i];
        }
        return null;
    }


    sendExcept(packet, client) {
        for(var i in this.clients) {
            if(client.character._id == this.clients[i].character._id) continue;
            this.clients[i].send(packet);
        }
    }
}