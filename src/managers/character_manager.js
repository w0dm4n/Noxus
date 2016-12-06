import Datacenter from "../database/datacenter"
import FriendHandler from "../handlers/friend_handler"
import * as Messages from "../io/dofus/messages"
import GameHandler from "../handlers/game_handler"
import Logger from "../io/logger"
import SpellManager from "../game/spell/spell_manager"
import WorldServer from "../network/world"

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
        return parseInt(sex ? CharacterManager.parseStrLook(breed.femaleLook)[1] : CharacterManager.parseStrLook(breed.maleLook)[1]);
    }

    static getDefaultScale(breedId, sex) {
        var breed = CharacterManager.getBreed(breedId);
        return parseInt(sex ? CharacterManager.parseStrLook(breed.femaleLook)[3] : CharacterManager.parseStrLook(breed.maleLook)[3]);
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
        if (character.party != null)
            character.party.removeMember(character, true);
        else if (character.invitation != null)
        {
            var party = WorldServer.getPartyById(character.invitation.party.id);
            if (party)
            {
                if (party.isInParty(character))
                    party.removeMember(character, true);
            }
        }
        try { FriendHandler.sendFriendDisconnect(character.client); } catch (error) { Logger.error(error); }
        try { character.save(); } catch (error) { Logger.error(error); }
    }

    static onConnected(character)
    {
        GameHandler.sendWelcomeMessage(character.client);
        FriendHandler.sendFriendsOnlineMessage(character.client);
        try { FriendHandler.warnFriends(character.client); } catch (error) { Logger.error(error); }
        character.sendWarnOnStateMessages(character.client.account.warnOnConnection);
        character.sendInventoryBag();
        character.client.send(new Messages.LifePointsRegenBeginMessage(10));
        character.statsManager.sendStats();
        CharacterManager.learnSpellsForCharacter(character);
        character.statsManager.sendSpellsList();
        CharacterManager.setRegenState(character);
    }

    static sendEmotesList(character)
    {
        character.client.send(new Messages.EmoteListMessage(character.emotes));
    }

    static setRegenState(character) {
        character.regenTimestamp = Math.floor(Date.now() / 1000);
    }

    static applyRegen(character) {
        var now = Math.floor(Date.now() / 1000);
        var diff = now - character.regenTimestamp;
        character.regen(diff);
        character.regenTimestamp = now;
    }

    static learnSpellsForCharacter(character) {
        var result = false;
        for(var s of character.getBreed().breedSpellsId) {
            var spellTemplate = SpellManager.getSpell(s);
            if(spellTemplate) {
                var spellLevel = SpellManager.getSpellLevel(spellTemplate.spellLevels[0]);
                if(spellLevel) {
                    if(!character.statsManager.hasSpell(spellTemplate._id) && spellLevel.minPlayerLevel <= character.level) {
                        character.spells.push({spellId: spellTemplate._id, spellLevel: 1});
                        result = true;
                    }
                }
            }
        }
        if(result)  {
            character.statsManager.sendSpellsList();
            character.save();
        }
    }
}