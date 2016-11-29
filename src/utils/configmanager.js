import Logger from "../io/logger"

export default class ConfigManager
{
    static config_file = "config.json";
    static configData = null;

    static load(callback)
    {
        Logger.infos("Loading configuration file ..");
        var fs = require('fs');
        fs.readFile(ConfigManager.config_file, 'utf8', function(err, data) 
        {  
            if (err)
            {
                Logger.error("An error occured while reading the configuration file" + err);
                callback();
            }
            ConfigManager.configData = JSON.parse(data);
            Logger.infos("Configuration file loaded successfully !");
            callback();
        });
    }
}