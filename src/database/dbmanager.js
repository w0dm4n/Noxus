import Logger from "../io/logger"
import Account from "./models/account";
import AccountFriend from "./models/account_friend";
import Character from "./models/character";
import ConfigManager from "../utils/configmanager.js"
var MongoClient = require('mongodb').MongoClient
var autoIncrement = require("mongodb-autoincrement");

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
                    level: parseInt(character.level),
                    experience: parseInt(character.experience),
                    kamas: parseInt(character.kamas),
                    mapid: parseInt(character.mapid),
                    cellid: parseInt(character.cellid),
                    dirId: parseInt(character.dirId),
                    life: character.life,
                    statsPoints: character.statsPoints,
                    spellPoints: character.spellPoints,                    
                    ZaapExist:character.ZaapExist,
                    ZaapSave:character.ZaapSave,                   
                    stats: {
                        strength: character.statsManager.getStatById(10).base,
                        vitality: character.statsManager.getStatById(11).base,
                        wisdom: character.statsManager.getStatById(12).base,
                        chance: character.statsManager.getStatById(13).base,
                        agility: character.statsManager.getStatById(14).base,
                        intelligence: character.statsManager.getStatById(15).base,
                    },
                   
                    
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

    static getFriend(query, callback){
        var collection = DBManager.db.collection('accounts_friends');
        collection.findOne(query, function(err, friend){
            if(friend == null){
                callback(null);
                return;
            }
            callback(new AccountFriend(friend));
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

    static getCharacter(query, callback){
        var collection = DBManager.db.collection('characters');
        collection.findOne(query, function(err, character){
            if(character == null){
                callback(null);
                return;
            }
            callback(new Character(character));
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
                result.push(new Character(characters[i]));
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
}