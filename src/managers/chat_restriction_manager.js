import ConfigManager from "../utils/configmanager.js"

export default class ChatRestrictionManager {
    static canSendSalesMessages(character)
    {
        if (character.lastSalesMessage == 0)
            return true
        else
        {
            var time = Date.now || function() {return +new Date;};
            var startTime = character.lastSalesMessage;
            var seconds = 0;
            var currentTime = time();
            var infinite = 0;
            while (startTime < currentTime) {
                seconds++;
                startTime++;
            }
            if (seconds >= (ConfigManager.configData.time_channel.sales * 1000))
                return true;
            else {
                var timeleft = (ConfigManager.configData.time_channel.sales * 1000) - seconds;
                if (Math.round((timeleft / 1000)) > 0)
                {
                    character.replyText("Ce canal est restreint pour améliorer sa lisibilité. Vous pourrez envoyer un nouveau message dans " + Math.round((timeleft / 1000)) + " secondes. Ceci ne vous autorise cependant pas pour autant à surcharger ce canal.");
                    return false;
                }
                else
                    return true;
            }
        }
    }

    static canSendSeekMessage(character)
    {
        if (character.lastSeekMessage == 0)
            return true
        else
        {
            var time = Date.now || function() {return +new Date;};
            var startTime = character.lastSeekMessage;
            var seconds = 0;
            var currentTime = time();
            var infinite = 0;
            while (startTime < currentTime) {
                seconds++;
                startTime++;
            }
            if (seconds >= (ConfigManager.configData.time_channel.seek * 1000))
                return true;
            else {
                var timeleft = (ConfigManager.configData.time_channel.seek * 1000) - seconds;
                if (Math.round((timeleft / 1000)) > 0)
                {
                    character.replyText("Ce canal est restreint pour améliorer sa lisibilité. Vous pourrez envoyer un nouveau message dans " + Math.round((timeleft / 1000)) + " secondes. Ceci ne vous autorise cependant pas pour autant à surcharger ce canal.");
                    return false;
                }
                else return true;
            }
        }
    }

    static canSendMessage(character)
    {
        if (character.lastMessage == 0)
            return true
        else
        {
            var time = Date.now || function() {return +new Date;};
            var startTime = character.lastMessage;
            var seconds = 0;
            var currentTime = time();
            var infinite = 0;
            if (!character.isTemporaryMuted)
            {
                while (startTime < currentTime) {
                    seconds++;
                    startTime++;
                }
                if (seconds >= (ConfigManager.configData.time_channel.global_time_per_message * 1000))
                {
                    return true;
                }
                else {
                        character.replyLangsMessage(1, 124, ["10"]);
                        character.isTemporaryMuted = true;
                        character.lastMessage = time();
                        return false;
                    }
            }
            else
            {
                 while (startTime < currentTime) {
                    seconds++;
                    startTime++;
                }
                if (seconds >= (ConfigManager.configData.time_channel.global_time_on_exceeded * 1000))
                {
                    return true;
                }
                else {
                    var timeleft = (ConfigManager.configData.time_channel.global_time_on_exceeded * 1000) - seconds;
                    if (Math.round((timeleft / 1000)) > 0)
                    {
                        character.replyLangsMessage(1, 124, [Math.round((timeleft / 1000)).toString()]);
                        return false;
                    }
                    else
                        return true;
                }
            }
        }
    }
}