import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import PlayableBreedEnum from "../enums/playable_breed_enum"
import Character from "../database/models/character"
import Loader from "../managers/loader_manager"
import CharacterManager from "../managers/character_manager.js"

export default class ApproachHandler {

    static getAvailableBreeds()
    {
        return 131071;
    }

    static getOptionalFeatures()
    {
        var features = []; 
        return features;
    }

    static generateRandomNickname() {
        var lettersPairs = [ "lo", "la", "li", "wo", "wi", "ka", "ko", "ki", "po",
                                                  "pi", "pa", "aw", "al", "na", "ni", "ny", "no", "ba", "bi",
                                                  "ra", "ri", "ze", "za", "da", "zel", "wo" ];
        var name = "";
        for (var i = 0; i <= Math.floor((Math.random() * 4) + 2); i++)
        {
            name += lettersPairs[Math.floor((Math.random() * lettersPairs.length - 1) + 1)];
        }
        name = name[0].toString().toUpperCase() + name.substring(1);
        return name;
    }

    static handleAuthenticationTicketMessage(client, packet)
    {
        client.account = AuthServer.getAccountByTicket(packet.ticket);
        Loader.LoadAccountData(client, function()
        {
            client.send(new Messages.AuthenticationTicketAcceptedMessage());
            client.send(new Messages.ServerSettingsMessage("fr", 0, 0, 30));
            client.send(new Messages.ServerOptionalFeaturesMessage(ApproachHandler.getOptionalFeatures()));

            client.send(new Messages.AccountCapabilitiesMessage(false, true, client.account.uid, ApproachHandler.getAvailableBreeds(), ApproachHandler.getAvailableBreeds(), 0));
            client.send(new Messages.TrustStatusMessage());
        });
    }

    static handleCharactersListRequestMessage(client, packet) {
        ApproachHandler.sendCharactersList(client);
    }
    
    static sendCharactersList(client) {
        DBManager.getCharacters({accountId: client.account.uid}, function(characters){
            client.characters = characters;
            client.characters.reverse();
            var baseCharactersInformations = new Array();
            for(var i in client.characters) {
                baseCharactersInformations.push(client.characters[i].getCharacterBaseInformations());
            }
            client.send(new Messages.CharactersListMessage(baseCharactersInformations));
        })
    }

    static handleCharacterNameSuggestionRequestMessage(client, packet) {
        var name = ApproachHandler.generateRandomNickname();
        client.send(new Messages.CharacterNameSuggestionSuccessMessage(name));
    }

    static CheckNameCondition(name)
    {
        var i = 0;
        var count_dash = 0;
        while (name[i])
        {
            if (name[i] == '-')
            {
                if (count_dash == 0)
                    count_dash++;
                else
                    return false;
            }
            var ascii = name[i].charCodeAt(0);
            if ((ascii >= 97 && ascii <= 122) || (ascii >= 65 && ascii <= 90) || name[i] == '-')
            {
                if (i > 0 && (ascii >= 65 && ascii <= 90) && name[(i - 1)] != '-')
                    return false;
            }
            else
                return false;
            i++;
        }
        return true;
    }

    static handleCharacterCreationRequestMessage(client, packet) {
        if (client.characters.length >= ConfigManager.configData.max_characters)
        {
            client.send(new Messages.CharacterCreationResultMessage(4));
            return;
        }
        if (!ApproachHandler.CheckNameCondition(packet.name) || packet.name.length < 3)
        {
            client.send(new Messages.CharacterCreationResultMessage(2));
            return;
        }
        if (ConfigManager.configData.breeds_allowed.indexOf(packet.breed) == -1)
        {
            client.send(new Messages.CharacterCreationResultMessage(5));
            return;
        }
        DBManager.getCharacter({name: packet.name}, function(character) {
            if(character == null) {
                var character = new Character({
                    _id: -1,
                    accountId: client.account.uid,
                    name: packet.name,
                    breed: packet.breed,
                    sex: packet.sex,
                    colors: packet.colors,
                    cosmeticId: packet.cosmeticId,
                    level: ConfigManager.configData.characters_start.level,
                    experience: CharacterManager.getExperienceFloorByLevel(ConfigManager.configData.characters_start.level).xp,
                    kamas: ConfigManager.configData.characters_start.kamas,
                    mapid: ConfigManager.configData.characters_start.startMap,
                    cellid: ConfigManager.configData.characters_start.startCell,
                    dirId: ConfigManager.configData.characters_start.startDir,
                    statsPoints: (ConfigManager.configData.characters_start.level * 5) - 5,
                    spellPoints: 0 + (ConfigManager.configData.characters_start.level) - 1,
                    ZaapSave : "",
                    ZaapExist : 0,
                });
                DBManager.createCharacter(character, function(){
                    client.send(new Messages.CharacterCreationResultMessage(0));
                    ApproachHandler.sendCharactersList(client);
                });
            }
            else {
                client.send(new Messages.CharacterCreationResultMessage(3));
            }
        });
    }

    static handleReloginTokenRequestMessage(client, packet) {
        //ApproachHandler.sendCharactersList(client);
    }

    static handleCharacterSelectionMessage(client, packet) {
        var selectedCharacter = null;
        for(var i in client.characters) {
            if(client.characters[i]._id == packet.id) { selectedCharacter = client.characters[i]; }
        }
        if(selectedCharacter != null) {
            client.character = selectedCharacter;
            client.character.client = client;
            client.send(new Messages.CharacterSelectedSuccessMessage(client.character.getCharacterBaseInformations(), false));
            client.send(new Messages.CharacterCapabilitiesMessage(6339));
            client.send(new Messages.CharacterLoadingCompleteMessage());
        }
        else {
            client.close();
        }
    }

    static checkCharacterId(characterId, client)
    {
        for (var character in client.characters)
        {
            if (client.characters[character]._id == characterId)
                return true;
        }
        return false;
    }

    static sendCharacterDeletionError(errorType, client)
    {
        client.send(new Messages.CharacterDeletionErrorMessage(errorType));
    }

    static handleCharacterDeletionRequestMessage(client, packet)
    {
        if (ApproachHandler.checkCharacterId(packet.characterId, client))
        {
            DBManager.deleteCharacter({_id: packet.characterId}, function(success)
            {
                if (success)
                    ApproachHandler.sendCharactersList(client);
                else
                    ApproachHandler.sendCharacterDeletionError(1, client);
            });
        }
        else
        {
            ApproachHandler.sendCharacterDeletionError(1, client);
        }
    }
}