import DBManager from "./dbmanager.js"
import Logger from "../io/logger"

export default class Datacenter {

    static breeds;
    static heads;
    static mapScrollsActions;
    static experiences;
    static smileys;

    static load(callback) {
        var loaders = [
            Datacenter.loadBreeds,
            Datacenter.loadHeads,
            Datacenter.loadMapScrollsActions,
            Datacenter.loadExperiences,
            Datacenter.loadSmileys,
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

    static getMapScrollActionById(id) {
        for(var i in Datacenter.mapScrollsActions) {
            if(Datacenter.mapScrollsActions[i].id == id) return Datacenter.mapScrollsActions[i];
        }
        return null;
    }

}