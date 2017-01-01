var fs, format, d, file, BigEndianReader, buffer, D2OFieldType, indexTableSize, i, indexTable, res$, addVector, classes, classesSize, cId, c, fieldCount, fieldI, t, ref$, objects, i$, objIndex, slice$ = [].slice;
String.prototype.titleize = function(){
return this.slice(0, 1).toUpperCase() + "" + this.slice(1).toLowerCase();
};
fs = require('fs');
format = partialize$(JSON.stringify, [void 8, null, '\t'], [0]);
d = function(it){
return console.log(format(it));
};

file = "./Dungeons"
console.log("Processing " + file);
BigEndianReader = (function(){
BigEndianReader.displayName = 'BigEndianReader';
var i$, ref$, len$, ref1$, name, type, size, prototype = BigEndianReader.prototype, constructor = BigEndianReader;
function BigEndianReader(buffer, offset){
    this.buffer = buffer;
    this.offset = offset != null ? offset : 0;
}
for (i$ = 0, len$ = (ref$ = [['Double', 'DoubleBE', 8], ['Int', 'Int32BE', 4], ['Uint', 'UInt32BE', 4], ['Short', 'Int16BE', 2], ['Byte', 'Int8', 1]]).length; i$ < len$; ++i$) {
    ref1$ = ref$[i$], name = ref1$[0], type = ref1$[1], size = ref1$[2];
    (fn$.call(BigEndianReader, type, size));
}
prototype.readUtf = function(){
    return this.sl(this.readShort()).toString();
};
prototype.readUtfBytes = function(it){
    return this.sl(it).toString();
};
prototype.readBool = function(){
    return this.readByte() == 1;
};
prototype.seek = function(offset){
    this.offset = offset;
};
prototype.skip = (function(it){
    return this.offset += it;
});
prototype.readI18n = function(){
    return this.readInt();
};
prototype.readString = function(){
    return this.readUtf();
};
prototype.readList = function(field, dim){
    var i, count, type, that, results$ = [];
    dim == null && (dim = 0);
    i = 0;
    count = this.readInt();
    for (; i < count; ++i) {
    type = field.vectorTypes[dim].type;
    if (type > 0) {
        if (that = classes[this.readInt() - 1]) {
        results$.push(buildObject(that));
        } else {
        results$.push(null);
        }
    } else {
        results$.push(this["read" + type.titleize()](field, dim + 1));
    }
    }
    return results$;
};
prototype.read = function(type, size){
    var v;
    v = this.buffer["read" + type](this.offset);
    this.offset += size;
    return v;
};
prototype.sl = function(it){
    var v;
    v = this.buffer.slice(this.offset, this.offset + it);
    this.offset += it;
    return v;
};
return BigEndianReader;
function fn$(type, size){
    prototype["read" + name] = function(){
    return this.read(type, size);
    };
}
}());
buffer = new BigEndianReader(fs.readFileSync("data/" + file + ".d2o"));
if ('D2O' !== buffer.readUtfBytes(3)) {
e('Invalid file');
}
D2OFieldType = {
'-1': 'Int',
'-2': 'Bool',
'-3': 'String',
'-4': 'Double',
'-5': 'I18N',
'-6': 'UInt',
'-99': 'List'
};
buffer.seek(buffer.readInt());
indexTableSize = buffer.readInt();
i = 0;
res$ = {};
for (; i < indexTableSize / 8; ++i) {
res$[buffer.readInt()] = buffer.readInt();
}
indexTable = res$;
addVector = function(it){
var v, ref$, t;
it.push(v = {
    name: buffer.readUtf(),
    type: (ref$ = D2OFieldType[t = buffer.readInt()]) != null ? ref$ : t
});
if (v.type === 'List') {
    addVector(it);
}
return it;
};
classes = [];
classesSize = buffer.readInt();
i = 0;
for (; i < classesSize; ++i) {
cId = buffer.readInt();
c = {
    memberName: buffer.readUtf(),
    packageName: buffer.readUtf()
};
fieldCount = buffer.readInt();
fieldI = 0;
res$ = [];
for (; fieldI < fieldCount; ++fieldI) {
    res$.push({
    name: buffer.readUtf(),
    type: t = (ref$ = D2OFieldType[t = buffer.readInt()]) != null ? ref$ : t,
    vectorTypes: t === 'List' && addVector([])
    });
}
c.fields = res$;
classes[cId - 1] = c;
}
fs.writeFile("extracted/fields/" + file + ".json", format(classes));
res$ = [];
for (i$ in indexTable) {
objIndex = indexTable[i$];
buffer.seek(objIndex);
res$.push(buildObject(classes[buffer.readInt() - 1]));
}
objects = res$;
function buildObject(arg$){
var fields, i$, len$, field, type, name, cId, that, results$ = {};
fields = arg$.fields;
for (i$ = 0, len$ = fields.length; i$ < len$; ++i$) {
    field = fields[i$], type = field.type, name = field.name;
    results$[name] = type > 0
    ? (cId = buffer.readInt(), (that = classes[cId - 1]) ? buildObject(that) : void 8)
    : buffer["read" + type.titleize()](field);
}
return results$;
}
fs.writeFile("extracted/" + file + ".json", format(objects));
function e(){
console.log.apply(this, arguments);
return process.exit();
}
function partialize$(f, args, where){
return function(){
    var params = slice$.call(arguments), i,
        len = params.length, wlen = where.length,
        ta = args ? args.concat() : [], tw = where ? where.concat() : [];
    for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
    return len < wlen && len ? partialize$(f, ta, tw) : f.apply(this, ta);
};
}