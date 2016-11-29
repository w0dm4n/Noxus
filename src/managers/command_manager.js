import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import ChatChannel from "../enums/chat_activable_channels_enum"
import Character from "../database/models/character"
import AccountRole from "../enums/account_role_enum"
import Common from "../Common"
import WorldManager from "../managers/world_manager"

export default class CommandManager {

    static commandsList = [
        { name:"infos", role:AccountRole.MODERATOR , description:"Donne des informations sur le serveur"},
        { name:"start", role:AccountRole.PLAYER , description: "Téléporte a la zone de départ"},
        { name:"goto", role:AccountRole.ANIMATOR, description: "Téléporte sur une map (mapId, cellId)"},
        { name:"help", role:AccountRole.ANIMATOR, description: "Affiche les commandes disponible"},
        { name:"kick", role:AccountRole.ANIMATOR, description: "Permet d'expulser un joueur du serveur"},
        { name:"ban", role:AccountRole.MODERATOR, description: "Permet de bannir un joueur du serveur"},
        { name:"unban", role:AccountRole.MODERATOR, description: "Permet de débannir un joueur du serveur"},
        { name:"exp", role:AccountRole.MODERATOR, description: "Permet d'ajouter des points d'experience"},
    ];
    
    static manageCommand(command, client)
    {
        try
        {
            var data = command.split(" ");
            var prefix = "handle_";
            var commandFound = false;
            if (data[0])
            {
                for (var command in CommandManager.commandsList)
                {
                    if (data[0] == CommandManager.commandsList[command].name)
                    {
                        commandFound = true;
                        if (client.account.scope >= CommandManager.commandsList[command].role)
                        {
                            CommandManager[(prefix + CommandManager.commandsList[command].name)](data, client);
                        }
                        else
                            client.character.replyError("Vous n'avez pas les droits suffisant pour exécuter cette commande.");
                    }
                }
                if (!commandFound)
                    client.character.replyError("Impossible de trouver cette commande, pour avoir la liste des commandes disponible écris <b>.help</b>");
            }
            else
            {
                client.character.replyError("Commande invalide !");
            }
        }
        catch (error)
        {
            if (client.account.scope >= AccountRole.ADMINISTRATOR)
                client.character.replyError("Erreur sur la commande: " + error);
            Logger.error(error);
        }
    }

    static getTime(time) 
    {
        var now = WorldServer.startTime;
        var sec_num = (time - now) / 1000;
        var days    = Math.floor(sec_num / (3600 * 24));
        var hours   = Math.floor((sec_num - (days * (3600 * 24)))/3600);
        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
        var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        return Math.round(hours) + "h" + Math.round(minutes) + "m" + Math.round(seconds) + "s";
    }

    static handle_infos(data, client)
    {
        var uptime = CommandManager.getTime(new Date());
        client.character.replyText("Noxus v" + Common.NOXUS_VERSION.major + "." + Common.NOXUS_VERSION.minor + " " + Common.NOXUS_VERSION.type + "<br/>" + "Il y a actuellement <b>" + WorldServer.getAllOnlineClients().length + "</b> joueurs en ligne<br/>Uptime: " + uptime);
    }

    static handle_start(data, client)
    {
        WorldManager.teleportClient(client, ConfigManager.configData.characters_start.startMap, ConfigManager.configData.characters_start.startCell, function(result) {
            if (result)
                client.character.replyText("Vous avez été téléporter a la zone de départ !");
            else
                client.character.replyError("Impossible de vous téléporter sur la carte.");
        });
    }

    static handle_goto(data, client)
    {
        if (data[1] && data[2])
        {
            WorldManager.teleportClient(client, data[1], data[2], function(result) {
                if (!result)
                    client.character.replyError("Impossible de vous téléporter sur cette carte !");
            });
        }
        else
            client.character.replyError("Erreur de syntaxe (.goto mapId cellId)");
    }

    static handle_help(data, client)
    {
        for (var command in CommandManager.commandsList)
        {
            if (client.account.scope >= CommandManager.commandsList[command].role)
            {
                client.character.replyText(CommandManager.commandsList[command].name + " - " + CommandManager.commandsList[command].description);
            }
        }
    }

    static handle_kick(data, client)
    {
        if (data[1])
        {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target)
            {
                if (target.account.scope <= client.account.scope)
                {
                    if (data[2])
                    {
                        var reason = "";
                        var i = 2;
                        while (data[i])
                            reason = reason + " " + data[i++];
                        target.character.disconnect("Vous avez été kick par " + client.character.name + ": " + reason);
                    }
                    else
                        target.character.disconnect("Vous avez été kick par " + client.character.name);
                }
                else
                    client.character.replyError("Impossible car la cible a un rang plus élevée que le votre !");
            }
            else
                client.character.replyError("Impossible de trouver le personnage.");
        }
        else
            client.character.replyError("Erreur de syntaxe (.kick name reason)");
    }

    static handle_ban(data, client)
    {
        if (data[1])
        {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target)
            {
                if (target.account.scope <= client.account.scope)
                {
                    if (data[2])
                    {
                        var reason = "";
                        var i = 2;
                        while (data[i])
                            reason = reason + " " + data[i++];
                        target.character.ban(client.character.name, reason);
                    }
                    else
                        target.character.ban(client.character.name, reason);
                }
                else
                    client.character.replyError("Impossible car la cible a un rang plus élevée que le votre !");
            }
            else
                client.character.replyError("Impossible de trouver le personnage.");
        }
        else
            client.character.replyError("Erreur de syntaxe (.ban name reason)");
    }

    static handle_unban(data, client)
    {
        if (data[1])
        {
            DBManager.getAccountByCharacterName(data[1], function(account)
            {
                if (account)
                {
                    if (account.locked == 1)
                    {
                        DBManager.updateAccount(account.uid, {locked: 0}, function()
                        {
                            client.character.replyText("Le personnage " + data[1] + " a bien été débanni !");
                        });  
                    }
                    else
                        client.character.replyError("Impossible car le compte du personnage n'est pas banni !");
                }
                else
                    client.character.replyError("Impossible de trouver ce personnage !");
            });
        }
        else
        {
             client.character.replyError("Erreur de syntaxe (.unban name)");
        }
    }

    static handle_exp(data, client) {
        if(data[1] && data[2]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if(target) {
                client.character.experience += parseInt(data[2]);
                client.character.statsManager.checkLevelUp();
                client.character.statsManager.sendStats();
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
        {
             client.character.replyError("Erreur de syntaxe (.exp name nb)");
        }
    }
}