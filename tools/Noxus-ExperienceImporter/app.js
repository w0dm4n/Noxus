var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'symbioz'
});

connection.connect();

connection.query('SELECT * FROM interactives', function(err, rows, fields) {
  if (err) throw err;
  var levels = [];
  console.log(rows);
  for(var i in rows) {
      levels.push({
			_id: parseInt(rows[i].Id),
           mapId: parseInt(rows[i].MapId),
           skillId: parseInt(rows[i].SkillId),
           elementId: parseInt(rows[i].ElementId),
           elementTypeId: parseInt(rows[i].ElementTypeId),
		   actionType: rows[i].ActionType,
		   optionalValue1: rows[i].OptionalValue1,
		   optionalValue2: rows[i].OptionalValue2
        })
  }
  
  var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
  var url = 'mongodb://localhost:27017/Noxus';
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection('interactives_objects');
    collection.insertMany(levels, function(){
        console.log("Done !");
    });
  });

});
