var ByteArray = require('./bytearray');
var fs = require('fs');

class MA2File {
    constructor(path) {
        this.path = path;
        this.items = [];
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
        var b = this.getReader();
        while(b.bytesAvailable)
        {
            var item = {};
            item.id = b.readUnsignedInt();
            item.typeId = b.readShort();
            item.name = b.readUTF();
            item.level = b.readShort();
            item.iconId = b.readUnsignedInt();
            item.skin = b.readUnsignedInt();
            item.look = b.readUTF();
            this.items.push(item);
        }
    }
}

var ma2File = new MA2File("./data/Items.ma3");
ma2File.read();
fs.writeFileSync("./data/items.json", JSON.stringify(ma2File.items)); 