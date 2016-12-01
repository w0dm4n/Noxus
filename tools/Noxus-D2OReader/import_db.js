var fileToImport = require('./extracted/MapPositions.json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/Noxus';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  console.log("Connected successfully to server");
  var collection = db.collection('maps_positions');
  var toImportArray = [];
  for(var m of fileToImport) {
	toImportArray.push({_id: m._id, posX: m.posX, posY: m.posY});
  }
    collection.insertMany(fileToImport);
});