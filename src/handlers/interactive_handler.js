
import * as Messages from "../io/dofus/messages"
import Logger from "../io/logger"
import Datacenter from "../database/datacenter"

export default class InteractiveHandler{

    static ActionInteractive = 
    {
        "Zaap":{ handle : InteractiveHandler.zaapHandler},
    }

    static getElementId(id){

        for(var i in Datacenter.interactivesObjects) {
            
            if(Datacenter.interactivesObjects[i].elementId == id)
                return Datacenter.interactivesObjects[i];               
        }
        return null;
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
             // Coucou yami il faut penser au condition :D
         }
     }

     static zaapHandler(client , packet)
     {
         client.send(new Messages.ZaapListMessage(0,[],[],100,[],0));
     }
}