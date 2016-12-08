import DBManager from "./dbmanager.js"
import Logger from "../io/logger"
import LookManager from "../managers/look_manager.js"

export default class Datacenter {

    static breeds;
    static heads;
    static mapScrollsActions;
    static experiences;
    static smileys;
    static interactivesObjects;
    static emotes;
    static items;
    static maps_positions;
    static spells;
    static spellsLevels;
    static elements;
    static npcs  = { npcs : [] , look : []};
    static npcMessages;
    static npcActions;
    

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
            Datacenter.loadNpcMessages,
            Datacenter.loadNpcActions,

        ];
        var loaded = 0;

        for(var i in loaders) {
            loaders[i](function(){
                loaded++;
                if(loaded == loaders.length) {
                    callback();
                }
            });
        }
    }

    static loadBreeds(callback) {
        DBManager.getBreeds(function(breeds){
            Datacenter.breeds = breeds;
            Logger.infos("Loaded '" + breeds.length + "' breed(s)");
            callback();
        });
    }

    static loadHeads(callback) {
        DBManager.getHeads(function(heads){
            Datacenter.heads = heads;
            Logger.infos("Loaded '" + heads.length + "' heads(s)");
            callback();
        });
    }

    static loadMapScrollsActions(callback) {
        DBManager.getMapScrollActions(function(scrolls){
            Datacenter.mapScrollsActions = scrolls;
            Logger.infos("Loaded '" + scrolls.length + "' map scroll actions(s)");
            callback();
        });
    }

    static loadExperiences(callback) {
        DBManager.getExperiences(function(experiences){
            Datacenter.experiences = experiences;
            Logger.infos("Loaded '" + experiences.length + "' experience floor(s)");
            callback();
        });
    }

    static loadSmileys(callback) {
        DBManager.getSmileys(function(smileys){
            Datacenter.smileys = smileys;
            Logger.infos("Loaded '" + smileys.length + "' smiley(s)");
            callback();
        });
    }

    static loadNpcs(callback) {
        DBManager.getNpcs(function(npcs){
            Datacenter.npcs.npcs = npcs;
            Logger.infos("Loaded '" + Datacenter.npcs.npcs.length + "' npcs");
          /* for(var i in Datacenter.npcs.npcs){
               if(Datacenter.npcs.npcs[i]._id != 1046 && Datacenter.npcs.npcs[i]._id != 3193 )
                     Datacenter.npcs.look.push(LookManager.parseLook(Datacenter.npcs.npcs[i].look))
                else
                     Datacenter.npcs.look.push(0)
     
            }*/
            
            Logger.infos("Loaded '" + Datacenter.npcs.look.length + "' lookNpcs");
            callback();

        });
    }

    static loadNpcMessages(callback) {
        DBManager.getNpcMessages(function(npcMessages){
            Datacenter.npcMessages = npcMessages;
            Logger.infos("Loaded '" + npcMessages.length + "' npc_messages");
            callback();
        });
    }

    static loadNpcActions(callback) {
        DBManager.getNpcActions(function(npcAction){
            Datacenter.npcAction = npcAction;
            Logger.infos("Loaded '" + npcAction.length + "' npc_actions");
            callback();
        });
    }
     static loadInteractivesObjects(callback) {
        DBManager.getInteractivesObjects(function(interactivesObjects){
            Datacenter.interactivesObjects = interactivesObjects;
            Logger.infos("Loaded '" + interactivesObjects.length + "' interactives object(s)");
            callback();
        });
    }

    static loadMapsPositions(callback) {
        DBManager.getMapPositions(function(maps_positions){
            Datacenter.maps_positions = maps_positions;
            Logger.infos("Loaded '" + maps_positions.length + "' maps_positions object(s)");
            callback();
        });
    }

    static loadElements(callback) {
        DBManager.getElements(function(elements){
            Datacenter.elements = elements;
            Logger.infos("Loaded '" + elements.length + "' elements object(s)");
            callback();
        });
    }

    static loadEmotes(callback) {
        DBManager.getEmotes(function(emotes){
            Datacenter.emotes = emotes;
            Logger.infos("Loaded '" + emotes.length + "' emote(s)");
            callback();
        });
    }

    static loadItems(callback) {
        DBManager.getItems(function(items){
            Datacenter.items = items;
            Logger.infos("Loaded '" + items.length + "' item(s)");
            callback();
        });
    }
    
    static loadSpells(callback) {
        DBManager.getSpells(function(spells){
            Datacenter.spells = spells;
            Logger.infos("Loaded '" + spells.length + "' spell(s)");
            callback();
        });
    }

    static loadSpellsLevels(callback) {
        DBManager.getSpellsLevels(function(spells){
            Datacenter.spellsLevels = spells;
            Logger.infos("Loaded '" + spells.length + "' spell level(s)");
            callback();
        });
    }

    static getMapScrollActionById(id) {
        for(var i in Datacenter.mapScrollsActions) {
            if(Datacenter.mapScrollsActions[i].id == id) 
            return Datacenter.mapScrollsActions[i];
        }
        return null;
    }

    static getMapElement(map,element) {
        for(var i in Datacenter.elements) {
            if(Datacenter.elements[i].Map_id == map && Datacenter.elements[i].Element_id  ==  element ) 
            return Datacenter.elements[i];
        }
        return null;
    }

    static getInteractivesMap(id) {
        var result = new Array();
        for(var i in Datacenter.interactivesObjects) {
            
            if(Datacenter.interactivesObjects[i].mapId == id)
                result.push(Datacenter.interactivesObjects[i]);
        }
        if(result.length > 0 )
            return result;
        else
            return [];
    }

    static getLookNpcs(id){
        for(var i in Datacenter.npcs.npcs) {
            if( Datacenter.npcs.npcs[i]._id == id) 
            {            
                return Datacenter.npcs.look[i];
            }
        }
        return null;
    }
}