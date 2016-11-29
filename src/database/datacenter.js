import DBManager from "./dbmanager.js"
import Logger from "../io/logger"

export default class Datacenter {

    static breeds;
    static heads;
    static mapScrollsActions;

    static load(callback) {
        Logger.infos("Loading breed(s) ..");
        DBManager.getBreeds(function(breeds){
            Datacenter.breeds = breeds;
            Logger.infos("Loaded '" + breeds.length + "' breed(s)");

            DBManager.getHeads(function(heads){
                Datacenter.heads = heads;
                Logger.infos("Loaded '" + heads.length + "' heads(s)");

                DBManager.getMapScrollActions(function(scrolls){
                    Datacenter.mapScrollsActions = scrolls;
                    Logger.infos("Loaded '" + scrolls.length + "' map scroll actions(s)");
                    callback();
                });
            });
        });
    }

    static getMapScrollActionById(id) {
        for(var i in Datacenter.mapScrollsActions) {
            if(Datacenter.mapScrollsActions[i].id == id) return Datacenter.mapScrollsActions[i];
        }
        return null;
    }

}