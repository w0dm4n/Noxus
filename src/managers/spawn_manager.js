import Datacenter from "../database/datacenter"
import FriendHandler from "../handlers/friend_handler"
import * as Messages from "../io/dofus/messages"
import GameHandler from "../handlers/game_handler"
import Logger from "../io/logger"
import SpellManager from "../game/spell/spell_manager"
import WorldServer from "../network/world"
import * as Types from "../io/dofus/types"
import ConfigManager from "../utils/configmanager.js"
import Basic from "../utils/basic"
import MonstersGroup from "../game/monsters/monsters_group"

export default class SpawnManager {

    static isThisSubArea(subs, areaId)
    {
        for (var sub of subs)
        {
            if (sub == areaId)
                return true;
        }
        return false;
    }

    static getMonsters(subArea)
    {
        var mapMonsters = [];
        var monsters = Datacenter.monsters;
        for (var monster of monsters)
        {
            if (monster.subareas && monster.subareas.length > 0) {
                if (SpawnManager.isThisSubArea(monster.subareas, subArea)){
                    mapMonsters.push(monster);
                }
            }
        }
        return mapMonsters;
    }

    static getMonsterFromRand(map, index)
    {
        var i = 0;
        var monsters = map.monsters;
        for (var monster of monsters)
        {
            if (i == index)
                return monster;
            i++;
        }
        return null;
    }

    static isMiniBossMonster(monster)
    {
        return (monster.isMiniBoss) ? true : false
    }

    static isBossMonster(monster)
    {
        return (monster.isBoss) ? true : false
    }

    static isQuestMonster(monster)
    {
        return (monster.isQuestMonster) ? true : false
    }

    static getMapInstanciedPerSubarea(subarea)
    {
        var maps = WorldServer.instanciedMaps;
        var listMaps = [];
        for (var map of maps)
        {
            if (map.subareaId == subarea)
                listMaps.push(map);
        }
        return listMaps;
    }

    static countMiniboss(groups)
    {
        var count = 0;
        for (var group of groups)
        {
            for (var monster of group.monsters) {
                if (SpawnManager.isMiniBossMonster(monster.template))
                    count++;
            }
        }
        return count;
    }

    static canSpawnMiniBoss(map)
    {
        var maps = SpawnManager.getMapInstanciedPerSubarea(map.subareaId);
        var total = 0;
        for (var tmp of maps)
        {
            var res = SpawnManager.countMiniboss(tmp.monstersGroups);
            if (res > 0)
                total += res;
        }
        total += SpawnManager.countMiniboss(map.monstersGroups);
        if (total >= ConfigManager.configData.monsters.miniboss_per_subarea)
            return false;
        else
            return true;
    }

    static getRandomMonsters(map, canSpawnMiniBoss = true)
    {
        var toGet = Basic.getRandomInt(2, ConfigManager.configData.monsters.monsters_per_group);
        var monsters = [];
        var monster = null;
        var bool = false;
        var rand = 0;
        var miniBossCount = 0;
        while (toGet > 0)
        {
            while (bool != true) {
                rand = Basic.getRandomInt(0, (map.monsters.length + 1));
                monster = SpawnManager.getMonsterFromRand(map, rand);
                if (monster != null && !SpawnManager.isBossMonster(monster) &&
                    !SpawnManager.isQuestMonster(monster))
                {
                    if (SpawnManager.isMiniBossMonster(monster) && canSpawnMiniBoss == true)
                    {
                        if (SpawnManager.canSpawnMiniBoss(map) && miniBossCount < 1) {
                            bool = true;
                            monsters.push(monster);
                            miniBossCount++;
                        }
                    }
                    else {
                        bool = true;
                        monsters.push(monster);
                    }
                }
            }
            bool = false;
            toGet--;
        }
        return monsters;
    }

    static getRandomWalkableCell(map)
    {
        var cell = -1;
        while (map.isWalkableCell(cell) != true)
            cell = Basic.getRandomInt(1, 550);
        return cell;
    }

    static generateGroup(map, canSpawnMiniBoss)
    {
        var group = null;
        var groupMonsterData = null;
        var monstersToGroup = SpawnManager.getRandomMonsters(map, canSpawnMiniBoss);

        if (monstersToGroup.length > 0) {
            var groupMonstersData = [];
            for (var monster of monstersToGroup) {
                groupMonsterData = SpawnManager.generateGroupMonsterData(monster);
                if (groupMonsterData)
                    groupMonstersData.push(groupMonsterData);
            }
            if (groupMonstersData.length > 0) {
                return new MonstersGroup(groupMonstersData, map, SpawnManager.getRandomWalkableCell(map));
            }
        }
        return group;
    }

    static generateGroupMonsterData(monster)
    {
        var grade = 1;
        return {templateId: monster._id, grade: grade};
    }

    static generateMonstersGroups(map)
    {
        if (map.monsters.length > 0)
        {
            var groupsLength = ConfigManager.configData.monsters.groups_per_map;

            while (groupsLength > 0)
            {
                var group = SpawnManager.generateGroup(map, true);
                if (group)
                    map.monstersGroups.push(group);
                groupsLength--;
            }
        }
    }

    static getMonstersAndGenerateGroups(map)
    {
        if (map.mapType == 0 && map.getZaap() == null)
        {
            map.monsters = SpawnManager.getMonsters(map.subareaId);
            if (map.monsters.length > 0)
            {
                SpawnManager.generateMonstersGroups(map);
                Logger.debug("Monsters generated for map instance " + map._id);
            }

        }
    }
}