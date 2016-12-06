
import * as Messages from "../io/dofus/messages"
import Logger from "../io/logger"
import Datacenter from "../database/datacenter"
import WorldManager from "../managers/world_manager"
import ConfigManager from "../utils/configmanager.js"
import ZaapDialog from "../game/dialog/zaap_dialog.js"
import ZaapiDialog from "../game/dialog/zaapi_dialog.js"

export default class InteractiveHandler {

    static ActionInteractive =
    {
        "Zaap": { handle: InteractiveHandler.openZaap },
        "Zaapi" : {handle : InteractiveHandler.openZaapi}
    }

    static parseInteractive(client, packet) {
        var element = InteractiveHandler.getElementId(packet.elemId);

        if (element != null) {

            client.send(new Messages.InteractiveUsedMessage(client.character._id, element.elementId, element.skillId, 30, true));
            client.send(new Messages.InteractiveUseEndedMessage(element.elementId, element.skillId));
            var handler = InteractiveHandler.ActionInteractive[element.actionType];
            if (handler) {
                handler.handle(client, packet);
            }
            else
                Logger.error("No handler found for interactive element " + element.elementId);
        }
    }
    static leaveInteractive(client, packet) {
        client.character.leaveDialog();
    }

    static teleportRequest(client, packet) {
        if (client.character.isInZaap() && packet.teleporterType == 0) {
             ZaapDialog.teleportZaap(client,packet);
        }else if(client.character.isInZaapi() && packet.teleporterType == 1)
        {
             ZaapiDialog.teleportZaapi(client,packet);        
        }
    }

    static openZaap(client, packet) {
        var zaapDialog = new ZaapDialog(client, packet);
        zaapDialog.openZaap();
    }

    static openZaapi(client, packet) {
        var zaapiDialog = new ZaapiDialog(client, packet);
        zaapiDialog.openZaapi();
    }

    static getCost(characterMap, teleportMap) {
        return Math.floor(Math.sqrt((characterMap.posX - teleportMap.posX) *
            (characterMap.posY - teleportMap.posX) + (characterMap.posY - teleportMap.posY) * (characterMap.posY - teleportMap.posY)) * 10.0);
    }

    static getElementId(id) {

        for (var i in Datacenter.interactivesObjects) {

            if (Datacenter.interactivesObjects[i].elementId == id)
                return Datacenter.interactivesObjects[i];
        }
        return null;
    }

    static getMapPosition(id) {

        for (var i in Datacenter.maps_positions) {

            if (Datacenter.maps_positions[i]._id == id)
                return Datacenter.maps_positions[i];
        }
        return null;
    }

    static getElementIdByType(id) {

        var result = new Array();


        for (var i in Datacenter.interactivesObjects) {

            if (Datacenter.interactivesObjects[i].actionType == id)
                result.push(Datacenter.interactivesObjects[i]);
        }
        return result;
    }

    static getElementIdByMap(map) {

        var result = new Array();

           for (var i in Datacenter.interactivesObjects) {
                var index = map.indexOf(Datacenter.interactivesObjects[i].mapId);
                if (index != -1)
                    result.push(Datacenter.interactivesObjects[i]);

        }
        
        return result;
    }

    static checkIfCharacterHaveZaap(client, map)
    {
        if (ConfigManager.configData.zaaps.all_zaaps == false  && map.zaap != null)
        {
            var zaapKnows = client.character.zaapKnows.indexOf(map._id);

            if(zaapKnows == -1)
            {
                
                client.character.zaapKnows.push(map._id);
                client.character.save();

                setTimeout(function(){client.character.replyLangsMessage(0, 24, [])}, 1000);

            }
        }
    }
}