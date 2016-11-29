var fileToImport = require('./extracted/MapScrollActions.json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/Noxus';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  console.log("Connected successfully to server");
  var collection = db.collection('map_scroll_actions');
    collection.insertMany(fileToImport);
});