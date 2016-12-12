
import * as Messages from "../../io/dofus/messages"
import Logger from "../../io/logger"
import Datacenter from "../../database/datacenter"
import WorldManager from "../../managers/world_manager"
import ConfigManager from "../../utils/configmanager.js"
import InteractiveHandler from "../../handlers/interactive_handler.js"
import Pathfinding from "../../game/pathfinding/pathfinding"


export default class ZaapDialog {

    constructor(client, packet) {
        this.client = client;
        this.packet = packet;
    }

    openZaap() {

        var client = this.client;
        client.character.setDialog(this);
        var zaap = {

            maps: [],
            subareas: [],
            price: [],
            type: []
        };

        var elementType;

        if (ConfigManager.configData.zaaps.all_zaaps == true) {

            elementType = InteractiveHandler.getElementIdByType("Zaap");

        } else if(ConfigManager.configData.zaaps.all_zaaps == false){
            elementType = InteractiveHandler.getElementIdByMap(client.character.zaapKnows);
      }

        if (elementType.length > 0) {
            var tmpArray = [];
            for (var i in elementType) {
                var element = elementType[i];

                (function (tmp) {
                    WorldManager.getMap(tmp.mapId, function (map) {
                        tmpArray.push(tmp);
                        if (map != null) {
                            if (InteractiveHandler.getMapPosition(tmp.mapId) != null && InteractiveHandler.getMapPosition(client.character.mapid) != null) {
                                zaap.maps.push(tmp.mapId);
                                zaap.subareas.push(map.subareaId);
                                var price = InteractiveHandler.getCost(InteractiveHandler.getMapPosition(client.character.mapid), InteractiveHandler.getMapPosition(tmp.mapId));
                                if (isNaN(price))
                                    price = 1000;
                                zaap.price.push(price);
                                zaap.type.push(0);
                            }
                        }
                        if (tmpArray.length == elementType.length) {

                            client.send(new Messages.ZaapListMessage(0, zaap.maps, zaap.subareas, zaap.price, zaap.type, client.character.mapid));
                        }
                    });

                })(element);

            }
        }
    }

    static teleportZaap(client, packet) {
        WorldManager.getMap(packet.mapId, function (map) {
            if (map != null) {
                var price = InteractiveHandler.getCost(InteractiveHandler.getMapPosition(client.character.mapid), InteractiveHandler.getMapPosition(packet.mapId));

                if (isNaN(price))
                    price = 1000;

                if (client.character.itemBag.money >= price) {
                    var cell = client.character.cellid;
                    var elements = Datacenter.getMapElement(map._id, map.getZaap().elementId);
                    if (elements != null) {
                        cell = elements.Cell_id;
                    }
                    WorldManager.teleportClient(client, packet.mapId, cell, function (result) {
                        if (!result)
                            client.character.replyError("Impossible de vous téléporter sur cette carte !");
                        else {
                            client.character.leaveDialog();
                        }
                    });
                } else {
                    client.character.replyLangsMessage(1, 82, []);
                }
            }
        });
    }

    close() {
        if (this.client != null) {
            this.client.character.closeDialog(this);
            this.client.send(new Messages.LeaveDialogMessage(10));
        }
    }
}