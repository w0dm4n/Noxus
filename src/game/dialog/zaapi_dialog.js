
import * as Messages from "../../io/dofus/messages"
import Logger from "../../io/logger"
import Datacenter from "../../database/datacenter"
import WorldManager from "../../managers/world_manager"
import ConfigManager from "../../utils/configmanager.js"
import InteractiveHandler from "../../handlers/interactive_handler.js"
import Pathfinding from "../../game/pathfinding/pathfinding"


export default class ZaapiDialog {

    constructor(client, packet) {
        this.client = client;
        this.packet = packet;
    }

    openZaapi() {
        var self = this;
        var client = this.client;
        client.character.setDialog(this);
        var zaapi = {

            maps: [],
            subareas: [],
            price: [],
            type: []
        };

        var elementType = InteractiveHandler.getElementIdByType("Zaapi");

        if (elementType.length > 0) {
            var tmpArray = [];
            for (var i in elementType) {
                var element = elementType[i];

                (function (tmp) {
                    WorldManager.getMap(tmp.mapId, function (map) {
                        tmpArray.push(tmp);
                        if (map != null) {
                            if (InteractiveHandler.getMapPosition(tmp.mapId) != null && InteractiveHandler.getMapPosition(client.character.mapid) != null) {
                                if (InteractiveHandler.getElementId(self.packet.elemId) != null) {
                                    if (InteractiveHandler.getElementId(self.packet.elemId).optionalValue1 == tmp.optionalValue1) {
                                        zaapi.maps.push(tmp.mapId);
                                        zaapi.subareas.push(map.subareaId);
                                        zaapi.price.push(20);
                                        zaapi.type.push(0);
                                    }
                                }
                            }
                        }
                        if (tmpArray.length == elementType.length) {

                            client.send(new Messages.TeleportDestinationsListMessage(1, zaapi.maps, zaapi.subareas, zaapi.price, zaapi.type));
                        }
                    });

                })(element);

            }
        }
    }

    static teleportZaapi(client, packet) {
        WorldManager.getMap(packet.mapId, function (map) {
            if (map != null) {
                var price = 20;
                if (client.character.itemBag.money >= price) {
                    var cell = client.character.cellid;
                    var elements = Datacenter.getMapElement(map._id, map.getZaapi().elementId);
                    if (elements != null) {
                        cell = elements.Cell_id;
                    }
                    WorldManager.teleportClient(client, packet.mapId, cell, function (result) {
                        if (!result)
                            client.character.replyError("Impossible de vous téléporter sur cette carte !");
                        else {
                            var cells = client.character.getMap().cells;
                            client.character.subKamas(price);
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