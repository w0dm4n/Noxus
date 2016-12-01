
import * as Messages from "../io/dofus/messages"
import Logger from "../io/logger"
import Datacenter from "../database/datacenter"
import WorldManager from "../managers/world_manager"
import ConfigManager from "../utils/configmanager.js"

export default class InteractiveHandler{

    static ActionInteractive = 
    {
        "Zaap":{ handle : InteractiveHandler.zaapHandler},
    }

     static parseInteractive(client , packet)
     {
         var element = InteractiveHandler.getElementId(packet.elemId);
         
         if(element != null)
         {
             
             client.send(new Messages.InteractiveUsedMessage(client.character._id,element.elementId,element.skillId,30,true));
             client.send(new Messages.InteractiveUseEndedMessage(element.elementId,element.skillId));
            var handler = InteractiveHandler.ActionInteractive[element.actionType];
            if (handler)
                handler.handle(client,packet);
            else
                Logger.error("No handler found for interactive element " + element.elementId);
         }
     }

     static zaapHandler(client , packet)
     {
         var zaap = {

             maps :[],
             subareas:[],
             price:[],
             type:[]
         };

         var elementType;
         if(ConfigManager.configData.zaaps.all_zaaps == true)
         {
             elementType = InteractiveHandler.getElementIdByType("Zaap");

         }else if(ConfigManager.configData.zaaps.all_zaaps == false)
         {
             
         }

         if(elementType.length > 0)
         {             
             for(var i in elementType)
             {
                 var element = elementType[i];

                 (function(tmp){
                    WorldManager.getMap(tmp.mapId,function(map)
                    {
                        if(map != null)
                        {
                            zaap.maps.push(tmp.mapId);   
                            zaap.subareas.push(map.subareaId);     
                            zaap.price.push(InteractiveHandler.getCost(client.character.getMap(), tmp.mapId));     
                            zaap.type.push(0);   
                            Logger.infos("h1");
                                    
                        }
                        if (tmp == elementType[(elementType.length - 1)])
                        {
                            Logger.infos("h2");
                             client.send(new Messages.ZaapListMessage(0,zaap.maps,zaap.subareas,zaap.price,zaap.type,client.character.mapid));       
                        }
                    });
                    
                 })(element);
                
             }
        }
     }

  

     static getCost(characterMap,teleportMap)
     {
         return 200;
       /*  return Math.floor(Math.sqrt((characterMap.WorldX - teleportMap.WorldX) *
                (characterMap.WorldY - teleportMap.WorldX) + (characterMap.WorldY - teleportMap.WorldY) * (characterMap.WorldY - teleportMap.WorldY))) * 10.0));*/
     }

    static getElementId(id){

        for(var i in Datacenter.interactivesObjects) {
            
            if(Datacenter.interactivesObjects[i].elementId == id)
                return Datacenter.interactivesObjects[i];               
        }
        return null;
    }

    static getElementIdByType(id , freezaap){
        
        var result = new Array();

        if(freezaap == null)
        {
            for(var i in Datacenter.interactivesObjects) {
                
                if(Datacenter.interactivesObjects[i].actionType == id)
                    result.push(Datacenter.interactivesObjects[i]);             
            }
            
        }else
        {
            for(var i in Datacenter.interactiveObjects){
                var index = freezaap.indexOf(Datacenter.interactiveObjects[i].mapId);
                if(index != -1)
                    result.push(Datacenter.interactiveObjects[i]);
            }
        }

        return result;       
    }   
}