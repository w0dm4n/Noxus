import Datacenter from "../database/datacenter"
import FriendHandler from "../handlers/friend_handler"
import * as Messages from "../io/dofus/messages"
import GameHandler from "../handlers/game_handler"

export default class CharacterManager {

    static getBreed(breedId) {
        for (var i in Datacenter.breeds) {
            var b = Datacenter.breeds[i];
            if (b.id == breedId) {
                return b;
            }
        }
    }

    static getHead(cosmeticId) {
        for (var i in Datacenter.heads) {
            var b = Datacenter.heads[i];
            if (b.id == cosmeticId) {
                return b;
            }
        }
    }

    static getDefaultLook(breedId, sex) {
        var breed = CharacterManager.getBreed(breedId);
        return (sex ? CharacterManager.parseStrLook(breed.femaleLook)[1] : CharacterManager.parseStrLook(breed.maleLook)[1]);
    }

    static parseStrLook(look) {
        var data = look.replace('{', '').replace('}', '').trim().split('|');
        return data;
    }

    static getFloorForStats(character, type) {
        var breed = character.getBreed();
        var value = 1;
        var current = character.statsManager.getStatById(type).base;
        var floor = null;
        switch (type) {
            case 10:
                floor = breed.statsPointsForStrength;
                break;
            case 11:
                floor = breed.statsPointsForVitality;
                break;
            case 12:
                floor = breed.statsPointsForWisdom;
                break;
            case 13:
                floor = breed.statsPointsForChance;
                break;
            case 14:
                floor = breed.statsPointsForAgility;
                break;
            case 15:
                floor = breed.statsPointsForIntelligence;
                break;
        }
        if (floor != null) {
            var validFloor = null;
            for (var i in floor) {
                var floorData = floor[i];
                if (current >= floorData[0]) {
                    validFloor = floorData[1];
                }
            }
            return validFloor;
        }
        return value;
    }

    static getExperienceFloorByLevel(exp) {
        return Datacenter.experiences.filter(function (x) {
            if (x.level == exp) return x;
        })[0];
    }

    static getExperienceFloorByExperience(exp) {
        var floor = null;
        for (var i in Datacenter.experiences) {
            if (Datacenter.experiences[i].xp <= exp) floor = Datacenter.experiences[i];
        }
        return floor;
    }

    static onDisconnect(character)
    {
        FriendHandler.sendFriendDisconnect(character.client);
        character.save();
    }

    static onConnected(character)
    {
        GameHandler.sendWelcomeMessage(character.client);
        FriendHandler.sendFriendsOnlineMessage(character.client);
        FriendHandler.warnFriends(character.client);
        character.sendWarnOnStateMessages(character.client.account.warnOnConnection);
        character.sendInventoryBag();
    }

    static sendEmotesList(character)
    {
        character.client.send(new Messages.EmoteListMessage(character.emotes));
    }
}