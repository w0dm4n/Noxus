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
import CharacterManager from "../managers/character_manager"
import ItemManager from "../game/item/item_manager"
import Datacenter from "../database/datacenter"
import EmoteHandler from "../handlers/emote_handler"
import DataCenter from "../database/datacenter"

export default class CommandManager {

    static commandsList = [
        { name:"infos", role:AccountRole.MODERATOR , description:"Donne des informations sur le serveur"},
        { name:"start", role:AccountRole.PLAYER , description: "Téléporte a la zone de départ"},
        { name:"go", role:AccountRole.ANIMATOR, description: "Téléporte sur une map (mapId, cellId)"},
        { name:"help", role:AccountRole.PLAYER, description: "Affiche les commandes disponible"},
        { name:"kick", role:AccountRole.ANIMATOR, description: "Permet d'expulser un joueur du serveur"},
        { name:"ban", role:AccountRole.MODERATOR, description: "Permet de bannir un joueur du serveur"},
        { name:"unban", role:AccountRole.MODERATOR, description: "Permet de débannir un joueur du serveur"},
        { name:"exp", role:AccountRole.MODERATOR, description: "Permet d'ajouter des points d'experience"},
        { name:"item", role:AccountRole.MODERATOR, description: "Créer un objet pour le personnage"},
        { name:"emote", role:AccountRole.ANIMATOR, description: "Ajoute une ou plusieurs émote a un personnage"},
        { name:"kamas", role:AccountRole.ANIMATOR, description: "Ajoute des kamas a un personnage"},
        { name:"goto", role:AccountRole.ANIMATOR, description: "Téleporte a un personnage"},
        { name:"gome", role:AccountRole.ANIMATOR, description: "Téleporte un personnage sur votre position"},
        { name:"itemset", role:AccountRole.ANIMATOR, description: "Vous ajoute une panoplie complète"},
        { name:"life", role:AccountRole.PLAYER, description: "Permet de régénerer ses points de vie"},
        { name:"save", role:AccountRole.PLAYER, description: "Permet de sauvegarder votre personnage"},
        { name:"saveworld", role:AccountRole.ANIMATOR, description: "Permet de sauvegarder tout les personnage connecté sur le serveur"},
        { name:"capital", role:AccountRole.MODERATOR, description: "Permet d'ajouter des points de capital"},
        { name:"spell", role:AccountRole.MODERATOR, description: "Permet d'apprendre un sort"},
        { name:"spellpoints", role:AccountRole.MODERATOR, description: "Permet d'ajouter des points de sort"},
        { name:"kill", role:AccountRole.MODERATOR, description: "Permet de tuer tout le monde"},
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
        if (client.character.isInFight())
        {
            client.character.replyError("Impossible d'exécuter cette commande en combat.");
            return;
        }
        WorldManager.teleportClient(client, ConfigManager.configData.characters_start.startMap, ConfigManager.configData.characters_start.startCell, function(result) {
            if (result)
                client.character.replyText("Vous avez été téléporter a la zone de départ !");
            else
                client.character.replyError("Impossible de vous téléporter sur la carte.");
        });
    }

    static handle_go(data, client)
    {
        if (data[1] && data[2])
        {
            WorldManager.teleportClient(client, data[1], data[2], function(result) {
                if (!result)
                    client.character.replyError("Impossible de vous téléporter sur cette carte !");
            });
        }
        else
            client.character.replyError("Erreur de syntaxe (.go mapId cellId)");
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
                target.character.experience += parseInt(data[2]);
                target.character.statsManager.checkLevelUp();
                target.character.statsManager.sendStats();
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
        {
             client.character.replyError("Erreur de syntaxe (.exp characterName nb)");
        }
    }

    static handle_item(data, client) {
        if(data[1]) {
            var item = ItemManager.generateItem(parseInt(data[1]));
            client.character.itemBag.add(item, true, function(){
                client.character.replyText("Objet <b>[" + item.getTemplate().nameId + "]</b> créé avec succès");
            });
        }
        else
        {
            client.character.replyError("Erreur de syntaxe (.item id name)");
        }
    }

    static getSetById(setId)
    {
        var sets = DataCenter.itemsSets;
        for (var i in sets)
        {
            if (sets[i]._id == setId)
                return sets[i];
        }
        return null;
    }

    static handle_itemset(data, client)
    {
        if(data[1]) {
            var set = CommandManager.getSetById(data[1]);
            if (set) {
                var items = set.items;
                for (var item of items)
                {
                    var newItem = ItemManager.generateItem(item);
                    client.character.itemBag.add(newItem, true, function(){
                    });
                }
            }
            else
                client.character.replyError("Impossible de trouver cette panoplie.");
        }
        else
        {
            client.character.replyError("Erreur de syntaxe (.itemset id name)");
        }
    }

    static handle_emote(data, client)
    {
        if(data[1] && data[2]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target) {
                if (data[2] == "all")
                {
                    target.character.emotes = EmoteHandler.getAllEmotes();
                    DBManager.updateCharacter(target.character._id, {emotes: target.character.emotes}, function () {

                    });
                    for (var i in target.character.emotes){
                        target.send(new Messages.EmoteAddMessage(target.character.emotes[i]));
                    }
                    if (target.character.name != client.character.name)
                        client.character.replyText("Toutes les émotes ont été rajouté au personnage " + target.character.name);
                }
                else
                {
                    var emote = EmoteHandler.getEmoteById(data[2]);
                    if (emote) {
                        if (!EmoteHandler.haveEmote(target, emote._id)) {
                            target.character.emotes.push(emote._id);
                            DBManager.updateCharacter(target.character._id, {emotes: target.character.emotes}, function () {
                                target.send(new Messages.EmoteAddMessage(emote._id));
                                if (target.character.name != client.character.name)
                                    client.character.replyText("L'émote a bien été ajouté sur le personnage " + target.character.name);
                            });
                        }
                        else
                            client.character.replyError("Emote déjà connu pour ce personnage");
                    }
                    else
                        client.character.replyError("Emote introuvable !");
                }
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
            client.character.replyError("Erreur de syntaxe (.emote characterName id/all)");
    }

    static handle_kamas(data, client)
    {
        if(data[1] && data[2]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target)
            {
                target.character.addKamas(data[2]);
                if (target.character.name != client.character.name)
                    client.character.replyText("Les kamas <b>(" + data[2] + ")</b> ont été ajouté au personnage " + target.character.name);

            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
            client.character.replyError("Erreur de syntaxe (.kamas characterName amount)");
    }

    static handle_goto(data, client)
    {
        if (client.character.isBusy())
        {
            client.character.replyError("Impossible car vous êtes occupé.");
            return;
        }
        if(data[1]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target) {
                WorldManager.teleportClient(client, target.character.mapid, target.character.cellid, function(result) {
                    if (!result)
                        client.character.replyError("Impossible de vous téléporter sur cette carte.");
                });
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
            client.character.replyError("Erreur de syntaxe (.goto characterName)");
    }

    static handle_gome(data, client)
    {
        if(data[1]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target) {
                if (!target.character.isBusy()) {
                    WorldManager.teleportClient(target, client.character.mapid, client.character.cellid, function (result) {
                        if (!result)
                            client.character.replyError("Impossible de téleporter le personnage sur cette carte.");
                    });
                } else
                    client.character.replyError("Impossible de téléporter ce personnage car il est occupé.");
            }
            else
                client.character.replyError("Impossible de trouver ce personnage.");
        }
        else
            client.character.replyError("Erreur de syntaxe (.gome characterName)");
    }

    static handle_life(data, client)
    {
        if (!client.character.isInFight()) {
            client.character.life = client.character.statsManager.getMaxLife();
            client.character.statsManager.sendStats();
            client.character.replyText("Vous avez récuperer vos points de vie !");
        }
        else
            client.character.replyImportant("Impossible en combat.");
    }

    static handle_save(data, client)
    {
        if (!client.character.isInFight()) {
            client.character.save(function(){
                client.character.replyText("Votre personnage a bien été sauvegardé !");
            });
        }
        else
            client.character.replyImportant("Impossible en combat.");
    }

    static handle_capital(data, client)
    {
        if(data[1] && data[2]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target) {
                target.character.statsPoints += parseInt(data[2]);
                client.character.replyText("Les points de caractéristiques ont bien été ajouté sur le personnage !");
                target.character.statsManager.sendStats();
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
            client.character.replyError("Erreur de syntaxe (.capital characterName capitalPoints)");
    }

    static handle_spell(data, client)
    {
        if(data[1] && data[2]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target) {
                if (CharacterManager.LearnSpellById(target.character, parseInt(data[2])))
                {
                    client.character.replyText("Le sort a été appris avec succès !");
                }
                else
                    client.character.replyError("Impossible d'apprendre ce sort.");
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
            client.character.replyError("Erreur de syntaxe (.spell characterName spellId)");
    }

    static handle_spellpoints(data, client)
    {
        if(data[1] && data[2]) {
            var target = WorldServer.getOnlineClientByCharacterName(data[1]);
            if (target) {
                target.character.spellPoints += parseInt(data[2]);
                client.character.replyText("Les points de sort ont bien été ajouté sur le personnage !");
                target.character.statsManager.sendStats();
            }
            else
                client.character.replyError("Impossible de trouver ce personnage !");
        }
        else
            client.character.replyError("Erreur de syntaxe (.spellpoints characterName spellPoints)");
    }

    static handle_kill(data, client)
    {
        if(client.character.isInFight()) {
            var fight = client.character.fight;
            var otherTeam = fight.getOppositeTeam(client.character.fighter.team);
            for(var f of otherTeam.getAliveMembers()) {
                f.current.life = 0;
                f.alive = false;
            }
            fight.checkEnd();
        }
    }

    static handle_saveworld(data, client)
    {
        WorldManager.saveWorld();
    }
}