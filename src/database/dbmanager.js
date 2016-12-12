import Logger from "../io/logger"
import Account from "./models/account";
import AccountFriend from "./models/account_friend";
import AccountIgnored from "./models/account_ignored";
import Character from "./models/character";
import ConfigManager from "../utils/configmanager.js"
import Datacenter from "../database/datacenter"
var MongoClient = require('mongodb').MongoClient
var autoIncrement = require("mongodb-autoincrement");
import EmoteHandler from "../handlers/emote_handler"

export default class DBManager {

    static db;

    static start(callback) {
        var url = 'mongodb://' + ConfigManager.configData.mongodb.host + ':' + ConfigManager.configData.mongodb.port + '/' 
        + ConfigManager.configData.mongodb.database;
        MongoClient.connect(url, function(err, db) {
            if (err)
            {
                Logger.error("An error occured while trying to connect to the database: " + err);
                return;
            }
            Logger.infos("Connected to MongoDB");
            DBManager.db = db;
            callback();
        });
    }

    static findAccount(accountName, callback) {
        var collection = DBManager.db.collection('accounts');
        var account = null;
        collection.find({ username: accountName }).toArray(function(err, docs) {
            if(docs.length > 0) {
                account = new Account(docs[0]);
            }
            callback(account);
        });
    }

    static createCharacter(character, callback) {
        autoIncrement.getNextSequence(DBManager.db, "characters", function (err, autoIndex) {
            DBManager.db.collection("characters", function(error, collection) {
                collection.insertOne({
                    _id: autoIndex,
                    accountId: parseInt(character.accountId),
                    name: character.name,
                    breed: character.breed,
                    sex: character.sex,
                    colors: character.colors,
                    cosmeticId: parseInt(character.cosmeticId),
                    scale: parseInt(character.scale),
                    level: parseInt(character.level),
                    experience: parseInt(character.experience),
                    mapid: parseInt(character.mapid),
                    cellid: parseInt(character.cellid),
                    dirId: parseInt(character.dirId),
                    life: character.life,
                    bagId: character.bagId,
                    statsPoints: character.statsPoints,
                    spellPoints: character.spellPoints,                    
                    zaapKnows:character.zaapKnows,
                    zaapSave:character.zaapSave,
                    spells: character.spells,
                    shortcuts: character.shortcuts,
                    stats: {
                        strength: character.statsManager.getStatById(10).base,
                        vitality: character.statsManager.getStatById(11).base,
                        wisdom: character.statsManager.getStatById(12).base,
                        chance: character.statsManager.getStatById(13).base,
                        agility: character.statsManager.getStatById(14).base,
                        intelligence: character.statsManager.getStatById(15).base,
                    },
                    emotes: EmoteHandler.getAllEmotes(),
                   
                    
                }, function(){
                    character._id = autoIndex;
                    callback(character);
                });
            });
        });
    }

    static createFriend(friend, callback){
         autoIncrement.getNextSequence(DBManager.db, "accounts_friends", function (err, autoIndex) {
             DBManager.db.collection("accounts_friends", function(error, collection) {
                collection.insertOne({
                    _id: autoIndex,
                    accountId: parseInt(friend.accountId),
                    friendAccountId: parseInt(friend.friendAccountId),
                }, function() {
                    friend._id = autoIndex;
                    callback(friend);
                });
            });
         });
    }

   static getFriends(query, callback){
        var collection = DBManager.db.collection('accounts_friends');
        collection.find(query).toArray(function(err, friends){
            var result = new Array();
            for(var i in friends) {
                result.push(new AccountFriend(friends[i]));
            }
            callback(result);
        });
    }

    static createIgnored(ignored, callback){
        autoIncrement.getNextSequence(DBManager.db, "accounts_ignoreds", function (err, autoIndex) {
            DBManager.db.collection("accounts_ignoreds", function(error, collection) {
                collection.insertOne({
                    _id: autoIndex,
                    accountId: parseInt(ignored.accountId),
                    ignoredAccountId: parseInt(ignored.ignoredAccountId),
                }, function() {
                    ignored._id = autoIndex;
                    callback(ignored);
                });
            });
        });
    }

    static getIgnoreds(query, callback){
        var collection = DBManager.db.collection('accounts_ignoreds');
        collection.find(query).toArray(function(err, ignoreds){
            var result = new Array();
            for(var i in ignoreds) {
                result.push(new AccountIgnored(ignoreds[i]));
            }
            callback(result);
        });
    }

    static deleteCharacter(query, callback) {
        var success = false;
        try{
            var collection = DBManager.db.collection('characters');
            collection.remove(query);
            success = true;
        }
        catch (error){
            Logger.error(error);
            success = false;
        }
        callback(success);
    }

    static removeFriend(query, callback) {
        var success = false;
        try{
            var collection = DBManager.db.collection('accounts_friends');
            collection.remove(query);
            success = true;
        }
        catch (error){
            Logger.error(error);
            success = false;
        }
        callback(success);
    }

    static removeIgnored(query, callback) {
        var success = false;
        try{
            var collection = DBManager.db.collection('accounts_ignoreds');
            collection.remove(query);
            success = true;
        }
        catch (error){
            Logger.error(error);
            success = false;
        }
        callback(success);
    }

    static getCharacter(query, callback){
        var collection = DBManager.db.collection('characters');
        collection.findOne(query, function(err, character){
            if(character == null){
                callback(null);
                return;
            }
            callback(new Character(character, false));
        });
    }

    static getAccount(query, callback){
        var collection = DBManager.db.collection('accounts');
        collection.findOne(query, function(err, account){
            if(account == null){
                callback(null);
                return;
            }
            callback(new Account(account));
        });
    }


    static getSmiley(query, callback){
        var collection = DBManager.db.collection('smileys');
        collection.findOne(query, function(err, smiley){
            if(smiley == null){
                callback(null);
                return;
            }
            callback(smiley);
        });
    }

    static getCharacters(query, callback){
        var collection = DBManager.db.collection('characters');
        collection.find(query).toArray(function(err, characters){
            var result = new Array();
            for(var i in characters) {
                result.push(new Character(characters[i], false));
            }
            callback(result);
        });
    }

    static getAccounts(query, callback){
        var collection = DBManager.db.collection('accounts');
        collection.find(query).toArray(function(err, accounts){
            var result = new Array();
            for(var i in accounts) {
                result.push(new Account(account[i]));
            }
            callback(result);
        });
    }

    static getBreeds(callback) {
        var collection = DBManager.db.collection('breeds');
        collection.find({}).toArray(function(err, breeds){
            callback(breeds);
        });
    }

    static getHeads(callback) {
        var collection = DBManager.db.collection('heads');
        collection.find({}).toArray(function(err, heads){
            callback(heads);
        });
    }

    static getMaps(query, callback) {
        var collection = DBManager.db.collection('maps');
        collection.find(query).toArray(function(err, maps){
            callback(maps);
        });
    }

    static updateAccount(uid, query, callback) {
        var collection = DBManager.db.collection('accounts');
        collection.update({ uid: uid }, { $set: query }, function() {
            callback();
        });
    }

    static updateCharacter(_id, query, callback) {
        var collection = DBManager.db.collection('characters');
        collection.update({ _id: _id }, { $set: query }, function() {
            callback();
        });
    }

    static updateCharacterbyName(name, query, callback) {
        var collection = DBManager.db.collection('characters');
        collection.update({ name: name }, { $set: query }, function() {
            callback();
        });
    }

    static getAccountByCharacterName(name, callback) {

        DBManager.getCharacter({name: name}, function(character)
            {
                var result = false;
                if (character)
                {
                    DBManager.getAccount({uid: character.accountId}, function(account)
                    {
                        if (account)
                        {
                            callback(account);
                        }
                        else
                            callback(null);
                    });
                }
                else
                    callback(null);
            });
    }

    static getMapScrollActions(callback) {
        var collection = DBManager.db.collection('map_scroll_actions');
        collection.find({}).toArray(function(err, scrolls){
            callback(scrolls);
        });
    }

    static getExperiences(callback) {
        var collection = DBManager.db.collection('experiences');
        collection.find({}).toArray(function(err, experiences){
            callback(experiences);
        });
    }

     static getSmileys(callback) {
        var collection = DBManager.db.collection('smileys');
        collection.find({}).toArray(function(err, smileys){
            callback(smileys);
        });
    }

    static getInteractivesObjects(callback) {
        var collection = DBManager.db.collection('interactives_objects');
        collection.find({}).toArray(function(err, interactivesObjects){
            callback(interactivesObjects);
        });              
    }

    static getMapPositions(callback) {
        var collection = DBManager.db.collection('maps_positions');
        collection.find({}).toArray(function(err, maps_positions){
            callback(maps_positions);
        });              
    }

    static getEmotes(callback) {
        var collection = DBManager.db.collection('emoticons');
        collection.find({}).toArray(function(err, emoticons){
            callback(emoticons);
        });              
    }

    static getItems(callback) {
        var collection = DBManager.db.collection('items');
        collection.find({}).toArray(function(err, items){
            callback(items);
        });
    }

    static getItemsSets(callback) {
        var collection = DBManager.db.collection('items_sets');
        collection.find({}).toArray(function(err, itemsSets){
            callback(itemsSets);
        });
    }

    static createItembag(bag, callback) {
        autoIncrement.getNextSequence(DBManager.db, "items_bags", function (err, autoIndex) {
            DBManager.db.collection("items_bags", function(error, collection) {
                collection.insertOne({
                    _id: autoIndex,
                    items: bag.items,
                    money: bag.money,
                }, function() {
                    bag._id = autoIndex;
                    callback(bag);
                });
            });
        });
    }

    static getBag(_id, callback) {
        var collection = DBManager.db.collection('items_bags');
        collection.find({_id: _id}).toArray(function(err, bags){
            (bags.length > 0 ? callback(bags[0]) : callback(null));
        });
    }

    static saveItembag(bag, query, callback) {
        var collection = DBManager.db.collection('items_bags');
        collection.update({ _id: bag._id }, { $set: query }, function() {
            callback();
        });
    }

    static getSpells(callback) {
        var collection = DBManager.db.collection('spells');
        collection.find({}).toArray(function(err, spells){
            callback(spells);
        });
    }

    static getElements(callback) {
        var collection = DBManager.db.collection('elements');
        collection.find({}).toArray(function(err, elements){
            callback(elements);
        });
    }

    static getNpcs(callback) {
        var collection = DBManager.db.collection('npcs');
        collection.find({}).toArray(function(err, npcs){
            callback(npcs);
        });
    }

    static getNpcActions(callback) {
        var collection = DBManager.db.collection('npcs_actions');
        collection.find({}).toArray(function(err, npcActions){
            callback(npcActions);
        });
    }

    static getNpcMessages(callback) {
        var collection = DBManager.db.collection('npcs_messages');
        collection.find({}).toArray(function(err, npcMessages){
            callback(npcMessages);
        });
    }

    static getNpcReplies(callback) {
        var collection = DBManager.db.collection('npcs_replies');
        collection.find({}).toArray(function(err, npcReplies){
            callback(npcReplies);
        });
    }

    static getNpcItems(callback) {
        var collection = DBManager.db.collection('npcs_items');
        collection.find({}).toArray(function(err, npcItems){
            callback(npcItems);
        });
    }

    static getNpcSpawns(callback) {
        var collection = DBManager.db.collection('npcs_spawns');
        collection.find({}).toArray(function(err, npcSpawns){
            callback(npcSpawns);
        });
    }

    static getSpellsLevels(callback) {
        var collection = DBManager.db.collection('spells_levels');
        collection.find({}).toArray(function(err, spellsLevels){
            callback(spellsLevels);
        });
    }
}