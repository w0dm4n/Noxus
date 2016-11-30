import AuthServer from "./network/auth"
import WorldServer from "./network/world"
import ConfigManager from "./utils/configmanager.js"
import Logger from "./io/logger"
import DBManager from "./database/dbmanager"
import Datacenter from "./database/datacenter"
import Common from "./Common"

class App {

    constructor() {
        Logger.infos("Noxus v" + Common.NOXUS_VERSION.major + "." + Common.NOXUS_VERSION.minor + " " + Common.NOXUS_VERSION.type);

        ConfigManager.load(function() {
            DBManager.start(function(){
                Logger.infos("Trying to connect to MongoDB ..");
                Datacenter.load(function() {        
                    Logger.infos("Starting network services ..");
                    try
                    {
                        AuthServer.start(ConfigManager.configData.host, ConfigManager.configData.auth_port);
                        WorldServer.start(ConfigManager.configData.host, ConfigManager.configData.world_port);
                    }
                    finally {
                        Logger.infos("Server started successfully !");
                    }
                });
            })
            
        });
    }
}

var app = new App(); 