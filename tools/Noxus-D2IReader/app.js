var ByteArray = require('./bytearray');
var fs = require('fs');

class D2IFile {
    constructor(path) {
        this.path = path;
        this.m_textIndexes = [];
        this.m_indexes = {};
    }

    toArrayBuffer(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    getReader() {
        var data = fs.readFileSync(this.path);
        return new ByteArray(this.toArrayBuffer(data));
    }

    read() {
        var reader = this.getReader();
        var indexPos = reader.readInt();
        reader.position = indexPos;
        var indexLen = reader.readInt();
        var addOffset = 0;
        for (var i = 0; i < indexLen; i += 9)
        {
            var key = reader.readInt();
            var nbAdditionnalStrings = reader.readByte();                    
            var dataPos = reader.readInt();
            var pos = reader.position;
            reader.position = dataPos + addOffset;
            this.m_indexes[key] = reader.readUTF();
            reader.position = pos;
            while (nbAdditionnalStrings-- > 0)
            {
                dataPos = reader.readInt();
                pos = reader.position;
                reader.position = dataPos + addOffset;
                var unusedString = reader.readUTF();
                reader.position = pos;
                i += 4;
            }
        }
        var lastOffset = reader.readInt() + reader.position;
        var locpos = reader.position;

        while (locpos < lastOffset)
        {
            var key = reader.readUTF();
            var dataPos = reader.readInt();
            locpos = reader.position;
            reader.position = dataPos;
            this.m_textIndexes[key] = reader.readUTF();
            reader.position = locpos;
        }
    }

    findTextByKey(key) {
        return this.m_textIndexes[key];
    }

    findTextById(key) {
        return this.m_indexes[key];
    }
}

var file = new D2IFile("./data/i18n_fr.d2i");
file.read();
var langs = [];
for(var i in file.m_textIndexes) {
    langs.push({id: i, text: file.m_textIndexes[i]});
}
fs.writeFileSync("./data/i18n_fr.json", JSON.stringify(langs)); 
console.log("D2I Readed");
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
  var url = 'mongodb://localhost:27017/Noxus';
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection('spells');
    collection.find({}).toArray(function(err, items){
		for(var i of items) {
			if(!i.nameId) continue;
		
			var updateItem = {
				nameId: file.m_indexes[i.nameId],
			};
			
			console.log(updateItem);
			
			collection.update({ _id: i._id }, { $set: updateItem }, function() {
				
			});
		}
	});   
  });