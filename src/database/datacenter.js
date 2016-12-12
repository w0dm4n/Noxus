import DBManager from "./dbmanager.js"
import Logger from "../io/logger"
import LookManager from "../managers/look_manager.js"
import NpcSpawn from "../database/models/npc_spawn.js"

export default class Datacenter {

    static breeds;
    static heads;
    static mapScrollsActions;
    static experiences;
    static smileys;
    static interactivesObjects;
    static emotes;
    static items;
    static itemsSets;
    static maps_positions;
    static spells;
    static spellsLevels;
    static elements;
    static npcs = { npcs: [], npcSpawns: [] , npcReplies :[] , npcActions :[] , npcItems : [] };


    static load(callback) {
        var loaders = [
            Datacenter.loadBreeds,
            Datacenter.loadHeads,
            Datacenter.loadMapScrollsActions,
            Datacenter.loadExperiences,
            Datacenter.loadSmileys,
            Datacenter.loadInteractivesObjects,
            Datacenter.loadEmotes,
            Datacenter.loadItems,
            Datacenter.loadMapsPositions,
            Datacenter.loadSpells,
            Datacenter.loadSpellsLevels,
            Datacenter.loadElements,
            Datacenter.loadNpcs,
            Datacenter.loadNpcItems,
            Datacenter.loadNpcActions,
            Datacenter.loadItemsSets,
            Datacenter.loadNpcsReplies

        ];
        var loaded = 0;

        for (var i in loaders) {
            loaders[i](function () {
                loaded++;
                if (loaded == loaders.length) {
                    callback();
                }
            });
        }
    }

    static loadBreeds(callback) {
        DBManager.getBreeds(function (breeds) {
            Datacenter.breeds = breeds;
            Logger.infos("Loaded '" + breeds.length + "' breed(s)");
            callback();
        });
    }

    static loadHeads(callback) {
        DBManager.getHeads(function (heads) {
            Datacenter.heads = heads;
            Logger.infos("Loaded '" + heads.length + "' heads(s)");
            callback();
        });
    }

    static loadMapScrollsActions(callback) {
        DBManager.getMapScrollActions(function (scrolls) {
            Datacenter.mapScrollsActions = scrolls;
            Logger.infos("Loaded '" + scrolls.length + "' map scroll actions(s)");
            callback();
        });
    }

    static loadExperiences(callback) {
        DBManager.getExperiences(function (experiences) {
            Datacenter.experiences = experiences;
            Logger.infos("Loaded '" + experiences.length + "' experience floor(s)");
            callback();
        });
    }

    static loadSmileys(callback) {
        DBManager.getSmileys(function (smileys) {
            Datacenter.smileys = smileys;
            Logger.infos("Loaded '" + smileys.length + "' smiley(s)");
            callback();
        });
    }

    static loadNpcs(callback) {
        DBManager.getNpcs(function (npcs) {
            Datacenter.npcs.npcs = npcs;
            Logger.infos("Loaded '" + Datacenter.npcs.npcs.length + "' npcs");

            DBManager.getNpcSpawns(function (npcSpawns) {
                for (var i in npcSpawns) {
                    var npc = Datacenter.getNpcs(npcSpawns[i].npcId);
                    
                    Datacenter.npcs.npcSpawns.push(new NpcSpawn(npcSpawns[i], LookManager.parseLook(npc.look),Datacenter.getNpcAction(npcSpawns[i].npcId)));                 
                }

                Logger.infos("Loaded '" + Datacenter.npcs.npcSpawns.length + "' npc_spawns");
                callback();
            });


        });
    }

    static loadNpcsReplies(callback){
        DBManager.getNpcReplies(function(npcReplies) {
                Datacenter.npcs.npcReplies = npcReplies;
                Logger.infos("Loaded '" + Datacenter.npcs.npcReplies.length + "' npcs_replies");
                callback();  
        });
    }

    static loadNpcItems(callback){
        DBManager.getNpcItems(function(npcItems) {
                Datacenter.npcs.npcItems = npcItems;
                Logger.infos("Loaded '" + Datacenter.npcs.npcItems.length + "' npcs_items");
                callback();  
        });
    }

    static loadNpcActions(callback) {
        DBManager.getNpcActions(function (npcAction) {
            Datacenter.npcs.npcActions = npcAction;
            Logger.infos("Loaded '" + npcAction.length + "' npc_actions");
            callback();
        });
    }
    static loadInteractivesObjects(callback) {
        DBManager.getInteractivesObjects(function (interactivesObjects) {
            Datacenter.interactivesObjects = interactivesObjects;
            Logger.infos("Loaded '" + interactivesObjects.length + "' interactives object(s)");
            callback();
        });
    }

    static loadMapsPositions(callback) {
        DBManager.getMapPositions(function (maps_positions) {
            Datacenter.maps_positions = maps_positions;
            Logger.infos("Loaded '" + maps_positions.length + "' maps_positions object(s)");
            callback();
        });
    }

    static loadElements(callback) {
        DBManager.getElements(function (elements) {
            Datacenter.elements = elements;
            Logger.infos("Loaded '" + elements.length + "' elements object(s)");
            callback();
        });
    }

    static loadEmotes(callback) {
        DBManager.getEmotes(function (emotes) {
            Datacenter.emotes = emotes;
            Logger.infos("Loaded '" + emotes.length + "' emote(s)");
            callback();
        });
    }

    static loadItems(callback) {
        DBManager.getItems(function (items) {
            Datacenter.items = items;
            Logger.infos("Loaded '" + items.length + "' item(s)");
            callback();
        });
    }

    static loadItemsSets(callback) {
        DBManager.getItemsSets(function (itemsSets) {
            Datacenter.itemsSets = itemsSets;
            Logger.infos("Loaded '" + itemsSets.length + "' items sets");
            callback();
        });
    }

    static loadSpells(callback) {
        DBManager.getSpells(function (spells) {
            Datacenter.spells = spells;
            Logger.infos("Loaded '" + spells.length + "' spell(s)");
            callback();
        });
    }

    static loadSpellsLevels(callback) {
        DBManager.getSpellsLevels(function (spells) {
            Datacenter.spellsLevels = spells;
            Logger.infos("Loaded '" + spells.length + "' spell level(s)");
            callback();
        });
    }

    static getMapScrollActionById(id) {
        for (var i in Datacenter.mapScrollsActions) {
            if (Datacenter.mapScrollsActions[i].id == id)
                return Datacenter.mapScrollsActions[i];
        }
        return null;
    }

    static getMapElement(map, element) {
        for (var i in Datacenter.elements) {
            if (Datacenter.elements[i].Map_id == map && Datacenter.elements[i].Element_id == element)
                return Datacenter.elements[i];
        }
        return null;
    }

    static getInteractivesMap(id) {
        var result = new Array();
        for (var i in Datacenter.interactivesObjects) {

            if (Datacenter.interactivesObjects[i].mapId == id)
                result.push(Datacenter.interactivesObjects[i]);
        }
        if (result.length > 0)
            return result;
        else
            return [];
    }

    static getLookNpcs(id) {
        for (var i in Datacenter.npcs.npcs) {
            if (Datacenter.npcs.npcs[i]._id == id) {
                return Datacenter.npcs.look[i];
            }
        }
        return null;
    }
    static getNpcs(id) {
        for (var i in Datacenter.npcs.npcs) {
            if (Datacenter.npcs.npcs[i]._id == id) {
                return Datacenter.npcs.npcs[i];
            }
        }
        return null;
    }

    static getNpcsMap(id) {
        var result = [];
        for (var i in Datacenter.npcs.npcSpawns) {
            if (Datacenter.npcs.npcSpawns[i].mapId == id) {
                result.push(Datacenter.npcs.npcSpawns[i]);
            }
        }
        return result;
    }

    static getNpcReplies(id){
        var result = [];
        for(var i in this.npcs.npcReplies){
            if(this.npcs.npcReplies[i].messageId == id){
                result.push(this.npcs.npcReplies[i]);
            }
        }

        return result;       
    }



    static getNpcAction(id){
        var result = [];
        for(var i in Datacenter.npcs.npcActions){
            if(this.npcs.npcActions[i].npcId == id){
                result.push(this.npcs.npcActions[i]);
            }
        }

        return result;       
    }

    static getNpcItems(id){
        var result = [];
        for(var i in Datacenter.npcs.npcItems){
            if(this.npcs.npcItems[i].npcId == id){
                result.push(this.npcs.npcItems[i]);
            }
        }

        return result;  
    }

}