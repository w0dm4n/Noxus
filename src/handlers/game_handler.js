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

// Import pathfinding
import MapPoint from "../game/pathfinding/map_point"
import Pathfinding from "../game/pathfinding/pathfinding"


export default class GameHandler {

    static handleGameContextCreateRequestMessage(client, packet) {
        client.send(new Messages.GameContextDestroyMessage());
        client.send(new Messages.GameContextCreateMessage(1));
		client.character.statsManager.sendStats();

        if(client.character.firstContext) {
			Loader.LoadCharacterData(client, function()
			{
				WorldManager.teleportClient(client, client.character.mapid, client.character.cellid, function(result){
					if (result)
					{
						client.character.firstContext = false;
						GameHandler.sendWelcomeMessage(client);
						FriendHandler.sendFriendsOnlineMessage(client);
					}
					else
					{
						Logger.error("An error occured while trying to load a map for the character " + client.character.name);
						client.character.disconnect();
					}
				});
			});
        }
		
    }

    static handleMapInformationsRequestMessage(client, packet) {
        if(client.character.getMap() != null) {
            client.character.getMap().sendComplementaryInformations(client);
        }
    }

    static sendWelcomeMessage(client)
    {
        client.character.replyLangsMessage(89, []);
        client.character.replyWelcome(ConfigManager.configData.welcome_message);
    }

    static handleGameMapMovementRequestMessage(client, packet) {
        var cells = [];
        for(var i in packet.keyMovements) {
            cells.push({id: packet.keyMovements[i] & 4095, dir: packet.keyMovements[i] >> 12, point: MapPoint.fromCellId(packet.keyMovements[i] & 4095)});
        }
        var distance = cells[0].point.distanceTo(cells[cells.length - 1].point);
		
		// Calcul du chemin
        var pathinding = new Pathfinding(client.character.getMap().dataMapProvider);
        var path = pathinding.findShortestPath(cells[0].id, cells[cells.length - 1].id, []);
        var keyMovements = [];
        keyMovements.push(client.character.cellid & 4095);
        for(var i in path) {
            keyMovements.push(path[i].id & 4095);
        }
		
        client.character.getMap().send(new Messages.GameMapMovementMessage(packet.keyMovements, client.character._id));
        client.character.nextCellId = cells[cells.length - 1].id;
		client.character.dirId = cells[0].point.orientationTo(cells[cells.length - 1].point);
    }
	
	static handleGameMapMovementCancelMessage(client, packet) {
		client.character.cellid = packet.cellId;
	}
	
	static handleGameMapMovementConfirmMessage(client, packet) {
		client.character.cellid = client.character.nextCellId;
		client.character.nextCellId = -1;
		//TODO: Check trigger etc ..
	}
	
	static handleChangeMapMessage(client, packet) {
		client.character.nextCellId = -1;
		var toCellId = -1;
		var mapDirection = -1;
		var mapClient = client.character.getMap();
		if(mapClient.topNeighbourId == packet.mapId) {
			mapDirection = 1;
			toCellId = client.character.cellid + 532;
		} else if(mapClient.rightNeighbourId == packet.mapId) {
			mapDirection = 2;
			toCellId = client.character.cellid - 13;
		} else if(mapClient.bottomNeighbourId == packet.mapId) {
			mapDirection = 3;
			toCellId = client.character.cellid - 532;
		} else if(mapClient.leftNeighbourId == packet.mapId) {
			mapDirection = 4;
			toCellId = client.character.cellid + 13;
		}

		if(mapDirection == -1) {
			Logger.error("Client trying to change map on a non neighbour map, maybe cheat ?");
			return;
		}
		var toMap = packet.mapId;
		var scrollAction = Datacenter.getMapScrollActionById(mapClient._id);
		if(scrollAction != null) {
			switch(mapDirection) {
				case 1:
				toMap = (scrollAction.topMapId == 0 ? toMap : scrollAction.topMapId);
				break;

				case 2:
				toMap = (scrollAction.rightMapId == 0 ? toMap : scrollAction.rightMapId);
				break;

				case 3:
				toMap = (scrollAction.bottomMapId == 0 ? toMap : scrollAction.bottomMapId);
				break;

				case 4:
				toMap = (scrollAction.leftMapId == 0 ? toMap : scrollAction.leftMapId);
				break;
			}
			Logger.debug('Override move map by scroll action : ' + toMap);
		}
		
		client.character.cellid = toCellId;
		WorldManager.teleportClient(client, toMap, client.character.cellid, function(){
			client.character.save();
		});
	}

	static handleGameMapChangeOrientationRequestMessage(client, packet) {
		client.character.dirId = packet.direction;
		var map = client.character.getMap();
		if(map) {
			map.send(new Messages.GameMapChangeOrientationMessage(new Types.ActorOrientation(client.character._id, client.character.dirId)));
		}
	}

	static handleStatsUpgradeRequestMessage(client, packet) {
		Logger.debug("Request stat boosting (id: " + packet.statId + ", nb: " + packet.boostPoint + ")");
		var bp = packet.boostPoint;
		while(bp > 0) {
			var floorCost = CharacterManager.getFloorForStats(client.character, packet.statId);
			if(client.character.statsPoints >= floorCost) {
				client.character.statsManager.getStatById(packet.statId).base++;
				client.character.statsPoints -= floorCost;
				bp -= floorCost;

				if(packet.statId == 11) { // Life update
					client.character.life++;
				}
			}
			else {
				break;
			}
		}
		client.character.statsManager.sendStats();
		client.character.save();
	}
}