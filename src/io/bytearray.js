var zlib = require('zlib');
var ByteArrayBase = (function () {
    function ByteArrayBase(buffer, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        this.bitsPending = 0;
        this.BUFFER_EXT_SIZE = 2048; //Buffer expansion size
        this.array = null;
        this.EOF_byte = -1;
        this.EOF_code_point = -1;
        if (buffer == undefined) {
            buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
            this.write_position = 0;
        }
        else if (buffer == null) {
            this.write_position = 0;
        }
        else {
            this.write_position = length > 0 ? length : buffer.byteLength;
        }
        if (buffer) {
            this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
        }
        this._position = 0;
        this.endian = ByteArrayBase.BIG_ENDIAN;
    }
    ByteArrayBase.prototype.readBits = function (bits, bitBuffer) {
        if (bitBuffer === void 0) { bitBuffer = 0; }
        if (bits == 0) {
            return bitBuffer;
        }
        var partial;
        var bitsConsumed;
        if (this.bitsPending > 0) {
            var _byte = this[this.position - 1] & (0xff >> (8 - this.bitsPending));
            bitsConsumed = Math.min(this.bitsPending, bits);
            this.bitsPending -= bitsConsumed;
            partial = _byte >> this.bitsPending;
        }
        else {
            bitsConsumed = Math.min(8, bits);
            this.bitsPending = 8 - bitsConsumed;
            partial = this.readUnsignedByte() >> this.bitsPending;
        }
        bits -= bitsConsumed;
        bitBuffer = (bitBuffer << bitsConsumed) | partial;
        return (bits > 0) ? this.readBits(bits, bitBuffer) : bitBuffer;
    };
    ByteArrayBase.prototype.writeBits = function (bits, value) {
        if (bits == 0) {
            return;
        }
        value &= (0xffffffff >>> (32 - bits));
        var bitsConsumed;
        if (this.bitsPending > 0) {
            if (this.bitsPending > bits) {
                this[this.position - 1] |= value << (this.bitsPending - bits);
                bitsConsumed = bits;
                this.bitsPending -= bits;
            }
            else if (this.bitsPending == bits) {
                this[this.position - 1] |= value;
                bitsConsumed = bits;
                this.bitsPending = 0;
            }
            else {
                this[this.position - 1] |= value >> (bits - this.bitsPending);
                bitsConsumed = this.bitsPending;
                this.bitsPending = 0;
            }
        }
        else {
            bitsConsumed = Math.min(8, bits);
            this.bitsPending = 8 - bitsConsumed;
            this.writeByte((value >> (bits - bitsConsumed)) << this.bitsPending);
        }
        bits -= bitsConsumed;
        if (bits > 0) {
            this.writeBits(bits, value);
        }
    };
    ByteArrayBase.prototype.resetBitsPending = function () {
        this.bitsPending = 0;
    };
    ByteArrayBase.prototype.calculateMaxBits = function (signed, values) {
        var b = 0;
        var vmax = -2147483648; //int.MIN_VALUE;
        if (!signed) {
            for (var usvalue in values) {
                b |= usvalue;
            }
        }
        else {
            for (var svalue in values) {
                if (svalue >= 0) {
                    b |= svalue;
                }
                else {
                    b |= ~svalue << 1;
                }
                if (vmax < svalue) {
                    vmax = svalue;
                }
            }
        }
        var bits = 0;
        if (b > 0) {
            bits = b.toString(2).length;
            if (signed && vmax > 0 && vmax.toString(2).length >= bits) {
                bits++;
            }
        }
        return bits;
    };
    Object.defineProperty(ByteArrayBase.prototype, "buffer", {
        // getter setter
        get: function () {
            return this.data.buffer;
        },
        set: function (value) {
            this.data = new DataView(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArrayBase.prototype, "dataView", {
        get: function () {
            return this.data;
        },
        set: function (value) {
            this.data = value;
            this.write_position = value.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArrayBase.prototype, "phyPosition", {
        get: function () {
            return this._position + this.data.byteOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArrayBase.prototype, "bufferOffset", {
        get: function () {
            return this.data.byteOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArrayBase.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            if (this._position < value) {
                if (!this.validate(this._position - value)) {
                    return;
                }
            }
            this._position = value;
            this.write_position = value > this.write_position ? value : this.write_position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArrayBase.prototype, "length", {
        get: function () {
            return this.write_position;
        },
        set: function (value) {
            this.validateBuffer(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArrayBase.prototype, "bytesAvailable", {
        get: function () {
            return this.data.byteLength - this._position;
        },
        enumerable: true,
        configurable: true
    });
    //end
    ByteArrayBase.prototype.clear = function () {
        this._position = 0;
    };
    ByteArrayBase.prototype.getArray = function () {
        if (this.array == null) {
            this.array = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
        }
        return this.array;
    };
    ByteArrayBase.prototype.setArray = function (array) {
        this.array = array;
        this.setBuffer(array.buffer, array.byteOffset, array.byteLength);
    };
    ByteArrayBase.prototype.setBuffer = function (buffer, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        if (buffer) {
            this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
            this.write_position = length > 0 ? length : buffer.byteLength;
        }
        else {
            this.write_position = 0;
        }
        this._position = 0;
    };
    /**
     * Reads a Boolean value from the byte stream. A single byte is read,
     * and true is returned if the byte is nonzero,
     * false otherwise.
     * @return	Returns true if the byte is nonzero, false otherwise.
    */
    ByteArrayBase.prototype.readBoolean = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_BOOLEAN))
            return null;
        return this.data.getUint8(this.position++) != 0;
    };
    /**
     * Reads a signed byte from the byte stream.
     * The returned value is in the range -128 to 127.
     * @return	An integer between -128 and 127.
     */
    ByteArrayBase.prototype.readByte = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_INT8))
            return null;
        return this.data.getInt8(this.position++);
    };
    /**
     * Reads the number of data bytes, specified by the length parameter, from the byte stream.
     * The bytes are read into the ByteArrayBase object specified by the bytes parameter,
     * and the bytes are written into the destination ByteArrayBase starting at the _position specified by offset.
     * @param	bytes	The ByteArrayBase object to read data into.
     * @param	offset	The offset (_position) in bytes at which the read data should be written.
     * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
     */
    ByteArrayBase.prototype.readBytes = function (_bytes, offset, length, createNewBuffer) {
        if (_bytes === void 0) { _bytes = null; }
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        if (length == 0) {
            length = this.bytesAvailable;
        }
        else if (!this.validate(length))
            return null;
        if (createNewBuffer) {
            _bytes = _bytes == null ? new ByteArrayBase(new ArrayBuffer(length)) : _bytes;
            //This method is expensive
            for (var i = 0; i < length; i++) {
                _bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
            }
        }
        else {
            //Offset argument ignored
            _bytes = _bytes == null ? new ByteArrayBase(null) : _bytes;
            _bytes.dataView = new DataView(this.data.buffer, this.bufferOffset + this.position, length);
            this.position += length;
        }
        return _bytes;
    };
    /**
     * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
     * @return	A double-precision (64-bit) floating-point number.
     */
    ByteArrayBase.prototype.readDouble = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_FLOAT64))
            return null;
        var value = this.data.getFloat64(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_FLOAT64;
        return value;
    };
    /**
     * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
     * @return	A single-precision (32-bit) floating-point number.
     */
    ByteArrayBase.prototype.readFloat = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_FLOAT32))
            return null;
        var value = this.data.getFloat32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_FLOAT32;
        return value;
    };
    /**
     * Reads a signed 32-bit integer from the byte stream.
     *
     *   The returned value is in the range -2147483648 to 2147483647.
     * @return	A 32-bit signed integer between -2147483648 and 2147483647.
     */
    ByteArrayBase.prototype.readInt = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_INT32))
            return null;
        var value = this.data.getInt32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_INT32;
        return value;
    };
    /**
     * Reads a signed 64-bit integer from the byte stream.
     *
     *   The returned value is in the range −(2^63) to 2^63 − 1
     * @return	A 64-bit signed integer between −(2^63) to 2^63 − 1
     */
    ByteArrayBase.prototype.readInt64 = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_UINT32))
            return null;
        var low = this.data.getInt32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_INT32;
        var high = this.data.getInt32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_INT32;
        return new ByteArrayBase.Int64(low, high);
    };
    /**
     * Reads a multibyte string of specified length from the byte stream using the
     * specified character set.
     * @param	length	The number of bytes from the byte stream to read.
     * @param	charSet	The string denoting the character set to use to interpret the bytes.
     *   Possible character set strings include "shift-jis", "cn-gb",
     *   "iso-8859-1", and others.
     *   For a complete list, see Supported Character Sets.
     *   Note: If the value for the charSet parameter
     *   is not recognized by the current system, the application uses the system's default
     *   code page as the character set. For example, a value for the charSet parameter,
     *   as in myTest.readMultiByte(22, "iso-8859-01") that uses 01 instead of
     *   1 might work on your development system, but not on another system.
     *   On the other system, the application will use the system's default code page.
     * @return	UTF-8 encoded string.
     */
    ByteArrayBase.prototype.readMultiByte = function (length, charSet) {
        if (!this.validate(length))
            return null;
        return "";
    };
    /**
     * Reads a signed 16-bit integer from the byte stream.
     *
     *   The returned value is in the range -32768 to 32767.
     * @return	A 16-bit signed integer between -32768 and 32767.
     */
    ByteArrayBase.prototype.readShort = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_INT16))
            return null;
        var value = this.data.getInt16(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_INT16;
        return value;
    };
    /**
     * Reads an unsigned byte from the byte stream.
     *
     *   The returned value is in the range 0 to 255.
     * @return	A 32-bit unsigned integer between 0 and 255.
     */
    ByteArrayBase.prototype.readUnsignedByte = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_UINT8))
            return null;
        return this.data.getUint8(this.position++);
    };
    /**
     * Reads an unsigned 32-bit integer from the byte stream.
     *
     *   The returned value is in the range 0 to 4294967295.
     * @return	A 32-bit unsigned integer between 0 and 4294967295.
     */
    ByteArrayBase.prototype.readUnsignedInt = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_UINT32))
            return null;
        var value = this.data.getUint32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT32;
        return value;
    };
    /**
     * Reads a variable sized unsigned integer (VX -> 16-bit or 32-bit) from the byte stream.
     *
     *   A VX is written as a variable length 2- or 4-byte element. If the index value is less than 65,280 (0xFF00),
     *   then the index is written as an unsigned two-byte integer. Otherwise the index is written as an unsigned
     *   four byte integer with bits 24-31 set. When reading an index, if the first byte encountered is 255 (0xFF),
     *   then the four-byte form is being used and the first byte should be discarded or masked out.
     *
     *   The returned value is in the range  0 to 65279 or 0 to 2147483647.
     * @return	A VX 16-bit or 32-bit unsigned integer between 0 to 65279 or 0 and 2147483647.
     */
    ByteArrayBase.prototype.readVariableSizedUnsignedInt = function () {
        var value;
        var c = this.readUnsignedByte();
        if (c != 0xFF) {
            value = c << 8;
            c = this.readUnsignedByte();
            value |= c;
        }
        else {
            c = this.readUnsignedByte();
            value = c << 16;
            c = this.readUnsignedByte();
            value |= c << 8;
            c = this.readUnsignedByte();
            value |= c;
        }
        return value;
    };
    /**
     * Fast read for WebGL since only Uint16 numbers are expected
     */
    ByteArrayBase.prototype.readU16VX = function () {
        return (this.readUnsignedByte() << 8) | this.readUnsignedByte();
    };
    /**
     * Reads an unsigned 64-bit integer from the byte stream.
     *
     *   The returned value is in the range 0 to 2^64 − 1.
     * @return	A 64-bit unsigned integer between 0 and 2^64 − 1
     */
    ByteArrayBase.prototype.readUnsignedInt64 = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_UINT32))
            return null;
        var low = this.data.getUint32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT32;
        var high = this.data.getUint32(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT32;
        return new ByteArrayBase.UInt64(low, high);
    };
    /**
     * Reads an unsigned 16-bit integer from the byte stream.
     *
     *   The returned value is in the range 0 to 65535.
     * @return	A 16-bit unsigned integer between 0 and 65535.
     */
    ByteArrayBase.prototype.readUnsignedShort = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_UINT16))
            return null;
        var value = this.data.getUint16(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT16;
        return value;
    };
    /**
     * Reads a UTF-8 string from the byte stream.  The string
     * is assumed to be prefixed with an unsigned short indicating
     * the length in bytes.
     * @return	UTF-8 encoded  string.
     */
    ByteArrayBase.prototype.readUTF = function () {
        if (!this.validate(ByteArrayBase.SIZE_OF_UINT16))
            return null;
        var length = this.data.getUint16(this.position, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT16;
        if (length > 0) {
            return this.readUTFBytes(length);
        }
        else {
            return "";
        }
    };
    /**
     * Reads a sequence of UTF-8 bytes specified by the length
     * parameter from the byte stream and returns a string.
     * @param	length	An unsigned short indicating the length of the UTF-8 bytes.
     * @return	A string composed of the UTF-8 bytes of the specified length.
     */
    ByteArrayBase.prototype.readUTFBytes = function (length) {
        if (!this.validate(length))
            return null;
        var _bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
        this.position += length;
        /*var _bytes: Uint8Array = new Uint8Array(new ArrayBuffer(length));
        for (var i = 0; i < length; i++) {
            _bytes[i] = this.data.getUint8(this.position++);
        }*/
        return this.decodeUTF8(_bytes);
    };
    ByteArrayBase.prototype.readStandardString = function (length) {
        if (!this.validate(length))
            return null;
        var str = "";
        for (var i = 0; i < length; i++) {
            str += String.fromCharCode(this.data.getUint8(this.position++));
        }
        return str;
    };
    ByteArrayBase.prototype.readStringTillNull = function (keepEvenByte) {
        if (keepEvenByte === void 0) { keepEvenByte = true; }
        var str = "";
        var num = 0;
        while (this.bytesAvailable > 0) {
            var _byte = this.data.getUint8(this.position++);
            num++;
            if (_byte != 0) {
                str += String.fromCharCode(_byte);
            }
            else {
                if (keepEvenByte && num % 2 != 0) {
                    this.position++;
                }
                break;
            }
        }
        return str;
    };
    /**
     * Writes a Boolean value. A single byte is written according to the value parameter,
     * either 1 if true or 0 if false.
     * @param	value	A Boolean value determining which byte is written. If the parameter is true,
     *   the method writes a 1; if false, the method writes a 0.
     */
    ByteArrayBase.prototype.writeBoolean = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_BOOLEAN);
        this.data.setUint8(this.position++, value ? 1 : 0);
    };
    /**
     * Writes a byte to the byte stream.
     * The low 8 bits of the
     * parameter are used. The high 24 bits are ignored.
     * @param	value	A 32-bit integer. The low 8 bits are written to the byte stream.
     */
    ByteArrayBase.prototype.writeByte = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_INT8);
        this.data.setInt8(this.position++, value);
    };
    ByteArrayBase.prototype.writeUnsignedByte = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_UINT8);
        this.data.setUint8(this.position++, value);
    };
    /**
     * Writes a sequence of length bytes from the
     * specified byte array, bytes,
     * starting offset(zero-based index) bytes
     * into the byte stream.
     *
     *   If the length parameter is omitted, the default
     * length of 0 is used; the method writes the entire buffer starting at
     * offset.
     * If the offset parameter is also omitted, the entire buffer is
     * written. If offset or length
     * is out of range, they are clamped to the beginning and end
     * of the bytes array.
     * @param	bytes	The ByteArrayBase object.
     * @param	offset	A zero-based index indicating the _position into the array to begin writing.
     * @param	length	An unsigned integer indicating how far into the buffer to write.
     */
    ByteArrayBase.prototype.writeBytes = function (_bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        this.validateBuffer(length);
        var tmp_data = new DataView(_bytes.buffer);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setUint8(this.position++, tmp_data.getUint8(i));
        }
    };
    /**
     * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
     * @param	value	A double-precision (64-bit) floating-point number.
     */
    ByteArrayBase.prototype.writeDouble = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_FLOAT64);
        this.data.setFloat64(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_FLOAT64;
    };
    /**
     * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
     * @param	value	A single-precision (32-bit) floating-point number.
    */
    ByteArrayBase.prototype.writeFloat = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_FLOAT32);
        this.data.setFloat32(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_FLOAT32;
    };
    /**
     * Writes a 32-bit signed integer to the byte stream.
     * @param	value	An integer to write to the byte stream.
    */
    ByteArrayBase.prototype.writeInt = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_INT32);
        this.data.setInt32(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_INT32;
    };
    /**
     * Writes a multibyte string to the byte stream using the specified character set.
     * @param	value	The string value to be written.
     * @param	charSet	The string denoting the character set to use. Possible character set strings
     *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
     *   For a complete list, see Supported Character Sets.
     */
    ByteArrayBase.prototype.writeMultiByte = function (value, charSet) {
    };
    /**
     * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
     * The high 16 bits are ignored.
     * @param	value	32-bit integer, whose low 16 bits are written to the byte stream.
     */
    ByteArrayBase.prototype.writeShort = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_INT16);
        this.data.setInt16(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_INT16;
    };
    ByteArrayBase.prototype.writeUnsignedShort = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_UINT16);
        this.data.setUint16(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT16;
    };
    /**
     * Writes a 32-bit unsigned integer to the byte stream.
     * @param	value	An unsigned integer to write to the byte stream.
     */
    ByteArrayBase.prototype.writeUnsignedInt = function (value) {
        this.validateBuffer(ByteArrayBase.SIZE_OF_UINT32);
        this.data.setUint32(this.position, value, this.endian == ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT32;
    };
    /**
     * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
     * is written first, as a 16-bit integer, followed by the bytes representing the
     * characters of the string.
     * @param	value	The string value to be written.
     */
    ByteArrayBase.prototype.writeUTF = function (value) {
        var utf8bytes = this.encodeUTF8(value);
        var length = utf8bytes.length;
        this.validateBuffer(ByteArrayBase.SIZE_OF_UINT16 + length);
        this.data.setUint16(this.position, length, this.endian === ByteArrayBase.LITTLE_ENDIAN);
        this.position += ByteArrayBase.SIZE_OF_UINT16;
        this.writeUint8Array(utf8bytes);
    };
    /**
     * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
     * but writeUTFBytes() does not prefix the string with a 16-bit length word.
     * @param	value	The string value to be written.
     */
    ByteArrayBase.prototype.writeUTFBytes = function (value) {
        this.writeUint8Array(this.encodeUTF8(value));
    };
    ByteArrayBase.prototype.toString = function () {
        return "[ByteArrayBase] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    };
    /****************************/
    /* EXTRA JAVASCRIPT APIs    */
    /****************************/
    /**
     * Writes a Uint8Array to the byte stream.
     * @param	value	The Uint8Array to be written.
     */
    ByteArrayBase.prototype.writeUint8Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setUint8(this.position++, _bytes[i]);
        }
    };
    /**
     * Writes a Uint16Array to the byte stream.
     * @param	value	The Uint16Array to be written.
     */
    ByteArrayBase.prototype.writeUint16Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setUint16(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
            this.position += ByteArrayBase.SIZE_OF_UINT16;
        }
    };
    /**
     * Writes a Uint32Array to the byte stream.
     * @param	value	The Uint32Array to be written.
     */
    ByteArrayBase.prototype.writeUint32Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setUint32(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
            this.position += ByteArrayBase.SIZE_OF_UINT32;
        }
    };
    /**
     * Writes a Int8Array to the byte stream.
     * @param	value	The Int8Array to be written.
     */
    ByteArrayBase.prototype.writeInt8Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setInt8(this.position++, _bytes[i]);
        }
    };
    /**
     * Writes a Int16Array to the byte stream.
     * @param	value	The Int16Array to be written.
     */
    ByteArrayBase.prototype.writeInt16Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setInt16(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
            this.position += ByteArrayBase.SIZE_OF_INT16;
        }
    };
    /**
     * Writes a Int32Array to the byte stream.
     * @param	value	The Int32Array to be written.
     */
    ByteArrayBase.prototype.writeInt32Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setInt32(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
            this.position += ByteArrayBase.SIZE_OF_INT32;
        }
    };
    /**
     * Writes a Float32Array to the byte stream.
     * @param	value	The Float32Array to be written.
     */
    ByteArrayBase.prototype.writeFloat32Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setFloat32(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
            this.position += ByteArrayBase.SIZE_OF_FLOAT32;
        }
    };
    /**
     * Writes a Float64Array to the byte stream.
     * @param	value	The Float64Array to be written.
     */
    ByteArrayBase.prototype.writeFloat64Array = function (_bytes) {
        this.validateBuffer(this.position + _bytes.length);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setFloat64(this.position, _bytes[i], this.endian === ByteArrayBase.LITTLE_ENDIAN);
            this.position += ByteArrayBase.SIZE_OF_FLOAT64;
        }
    };
    /**
     * Read a Uint8Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Uint8Array.
     */
    ByteArrayBase.prototype.readUint8Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        if (!this.validate(length))
            return null;
        if (!createNewBuffer) {
            var result = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
            this.position += length;
        }
        else {
            result = new Uint8Array(new ArrayBuffer(length));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint8(this.position);
                this.position += ByteArrayBase.SIZE_OF_UINT8;
            }
        }
        return result;
    };
    /**
     * Read a Uint16Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Uint16Array.
     */
    ByteArrayBase.prototype.readUint16Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        var size = length * ByteArrayBase.SIZE_OF_UINT16;
        if (!this.validate(size))
            return null;
        if (!createNewBuffer) {
            var result = new Uint16Array(this.buffer, this.bufferOffset + this.position, length);
            this.position += size;
        }
        else {
            result = new Uint16Array(new ArrayBuffer(size));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint16(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT16;
            }
        }
        return result;
    };
    /**
     * Read a Uint32Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Uint32Array.
     */
    ByteArrayBase.prototype.readUint32Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        var size = length * ByteArrayBase.SIZE_OF_UINT32;
        if (!this.validate(size))
            return null;
        if (!createNewBuffer) {
            var result = new Uint32Array(this.buffer, this.bufferOffset + this.position, length);
            this.position += size;
        }
        else {
            result = new Uint32Array(new ArrayBuffer(size));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint32(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_UINT32;
            }
        }
        return result;
    };
    /**
     * Read a Int8Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Int8Array.
     */
    ByteArrayBase.prototype.readInt8Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        if (!this.validate(length))
            return null;
        if (!createNewBuffer) {
            var result = new Int8Array(this.buffer, this.bufferOffset + this.position, length);
            this.position += length;
        }
        else {
            result = new Int8Array(new ArrayBuffer(length));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getInt8(this.position);
                this.position += ByteArrayBase.SIZE_OF_INT8;
            }
        }
        return result;
    };
    /**
     * Read a Int16Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Int16Array.
     */
    ByteArrayBase.prototype.readInt16Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        var size = length * ByteArrayBase.SIZE_OF_INT16;
        if (!this.validate(size))
            return null;
        if (!createNewBuffer) {
            var result = new Int16Array(this.buffer, this.bufferOffset + this.position, length);
            this.position += size;
        }
        else {
            result = new Int16Array(new ArrayBuffer(size));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getInt16(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT16;
            }
        }
        return result;
    };
    /**
     * Read a Int32Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Int32Array.
     */
    ByteArrayBase.prototype.readInt32Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        var size = length * ByteArrayBase.SIZE_OF_INT32;
        if (!this.validate(size))
            return null;
        if (!createNewBuffer) {
            if ((this.bufferOffset + this.position) % 4 == 0) {
                var result = new Int32Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += size;
            }
            else {
                var tmp = new Uint8Array(new ArrayBuffer(size));
                for (var i = 0; i < size; i++) {
                    tmp[i] = this.data.getUint8(this.position);
                    this.position += ByteArrayBase.SIZE_OF_UINT8;
                }
                result = new Int32Array(tmp.buffer);
            }
        }
        else {
            result = new Int32Array(new ArrayBuffer(size));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getInt32(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_INT32;
            }
        }
        return result;
    };
    /**
     * Read a Float32Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Float32Array.
     */
    ByteArrayBase.prototype.readFloat32Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        var size = length * ByteArrayBase.SIZE_OF_FLOAT32;
        if (!this.validate(size))
            return null;
        if (!createNewBuffer) {
            if ((this.bufferOffset + this.position) % 4 == 0) {
                var result = new Float32Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += size;
            }
            else {
                var tmp = new Uint8Array(new ArrayBuffer(size));
                for (var i = 0; i < size; i++) {
                    tmp[i] = this.data.getUint8(this.position);
                    this.position += ByteArrayBase.SIZE_OF_UINT8;
                }
                result = new Float32Array(tmp.buffer);
            }
        }
        else {
            result = new Float32Array(new ArrayBuffer(size));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getFloat32(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_FLOAT32;
            }
        }
        return result;
    };
    /**
     * Read a Float64Array from the byte stream.
     * @param	length An unsigned short indicating the length of the Float64Array.
     */
    ByteArrayBase.prototype.readFloat64Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
        var size = length * ByteArrayBase.SIZE_OF_FLOAT64;
        if (!this.validate(size))
            return null;
        if (!createNewBuffer) {
            var result = new Float64Array(this.buffer, this.position, length);
            this.position += size;
        }
        else {
            result = new Float64Array(new ArrayBuffer(size));
            for (var i = 0; i < length; i++) {
                result[i] = this.data.getFloat64(this.position, this.endian === ByteArrayBase.LITTLE_ENDIAN);
                this.position += ByteArrayBase.SIZE_OF_FLOAT64;
            }
        }
        return result;
    };
    ByteArrayBase.prototype.validate = function (len) {
        //len += this.data.byteOffset;
        if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
            return true;
        }
        else {
            throw 'Error #2030: End of file was encountered.';
        }
    };
    ByteArrayBase.prototype.compress = function () {
        var _this = this;
        var finished = false;
        zlib.deflate(this.toBuffer(), function (err, result) {
            finished = true;
            _this.fromBuffer(result);
        });
        while (!finished) {
            uvrun2_1.runOnce();
        }
    };
    ByteArrayBase.prototype.uncompress = function () {
        var _this = this;
        var finished = false;
        zlib.inflate(this.toBuffer(), function (err, result) {
            finished = true;
            _this.fromBuffer(result);
        });
        while (!finished) {
            uvrun2_1.runOnce();
        }
    };
    ByteArrayBase.prototype.toBuffer = function () {
        var buffer = new Buffer(this.buffer.byteLength);
        var view = new Uint8Array(this.buffer);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    };
    ByteArrayBase.prototype.fromBuffer = function (buff) {
        var ab = new ArrayBuffer(buff.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buff.length; ++i) {
            view[i] = buff[i];
        }
        this.setBuffer(ab);
    };
    /**********************/
    /*  PRIVATE METHODS   */
    /**********************/
    ByteArrayBase.prototype.validateBuffer = function (len) {
        this.write_position = len > this.write_position ? len : this.write_position;
        if (this.data.byteLength < len) {
            var tmp = new Uint8Array(new ArrayBuffer(len + this.BUFFER_EXT_SIZE));
            tmp.set(new Uint8Array(this.data.buffer));
            this.data.buffer = tmp.buffer;
        }
    };
    /**
     * UTF-8 Encoding/Decoding
     */
    ByteArrayBase.prototype.encodeUTF8 = function (str) {
        var pos = 0;
        var codePoints = this.stringToCodePoints(str);
        var outputBytes = [];
        while (codePoints.length > pos) {
            var code_point = codePoints[pos++];
            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            }
            else {
                var count, offset;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                }
                else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                }
                else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
                }
                outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                while (count > 0) {
                    var temp = this.div(code_point, Math.pow(64, count - 1));
                    outputBytes.push(0x80 + (temp % 64));
                    count -= 1;
                }
            }
        }
        return new Uint8Array(outputBytes);
    };
    ByteArrayBase.prototype.decodeUTF8 = function (data) {
        var fatal = false;
        var pos = 0;
        var result = "";
        var code_point;
        var utf8_code_point = 0;
        var utf8_bytes_needed = 0;
        var utf8_bytes_seen = 0;
        var utf8_lower_boundary = 0;
        while (data.length > pos) {
            var _byte = data[pos++];
            if (_byte === this.EOF_byte) {
                if (utf8_bytes_needed !== 0) {
                    code_point = this.decoderError(fatal);
                }
                else {
                    code_point = this.EOF_code_point;
                }
            }
            else {
                if (utf8_bytes_needed === 0) {
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    }
                    else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        }
                        else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        }
                        else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        }
                        else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                }
                else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                }
                else {
                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                    if (utf8_bytes_seen !== utf8_bytes_needed) {
                        code_point = null;
                    }
                    else {
                        var cp = utf8_code_point;
                        var lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        }
                        else {
                            code_point = this.decoderError(fatal, _byte);
                        }
                    }
                }
            }
            //Decode string
            if (code_point !== null && code_point !== this.EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0)
                        result += String.fromCharCode(code_point);
                }
                else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }
        return result;
    };
    ByteArrayBase.prototype.encoderError = function (code_point) {
        throw 'EncodingError! The code point ' + code_point + ' could not be encoded.';
    };
    ByteArrayBase.prototype.decoderError = function (fatal, opt_code_point) {
        if (fatal) {
            throw 'DecodingError';
        }
        return opt_code_point || 0xFFFD;
    };
    ByteArrayBase.prototype.inRange = function (a, min, max) {
        return min <= a && a <= max;
    };
    ByteArrayBase.prototype.div = function (n, d) {
        return Math.floor(n / d);
    };
    ByteArrayBase.prototype.stringToCodePoints = function (string) {
        /** @type {Array.<number>} */
        var cps = [];
        // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
        var i = 0, n = string.length;
        while (i < string.length) {
            var c = string.charCodeAt(i);
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            }
            else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            }
            else {
                if (i === n - 1) {
                    cps.push(0xFFFD);
                }
                else {
                    var d = string.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        var a = c & 0x3FF;
                        var b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    }
                    else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    };
    ByteArrayBase.BIG_ENDIAN = "bigEndian";
    ByteArrayBase.LITTLE_ENDIAN = "littleEndian";
    ByteArrayBase.SIZE_OF_BOOLEAN = 1;
    ByteArrayBase.SIZE_OF_INT8 = 1;
    ByteArrayBase.SIZE_OF_INT16 = 2;
    ByteArrayBase.SIZE_OF_INT32 = 4;
    ByteArrayBase.SIZE_OF_INT64 = 8;
    ByteArrayBase.SIZE_OF_UINT8 = 1;
    ByteArrayBase.SIZE_OF_UINT16 = 2;
    ByteArrayBase.SIZE_OF_UINT32 = 4;
    ByteArrayBase.SIZE_OF_UINT64 = 8;
    ByteArrayBase.SIZE_OF_FLOAT32 = 4;
    ByteArrayBase.SIZE_OF_FLOAT64 = 8;
    return ByteArrayBase;
})();
var ByteArrayBase;
(function (ByteArrayBase) {
    var Int64 = (function () {
        function Int64(low, high) {
            if (low === void 0) { low = 0; }
            if (high === void 0) { high = 0; }
            this.low = low;
            this.high = high;
        }
        Int64.prototype.value = function () {
            //this._value = (this.low | (this.high << 32));
            var _h = this.high.toString(16);
            var _hd = 8 - _h.length;
            if (_hd > 0) {
                for (var i = 0; i < _hd; i++) {
                    _h = '0' + _h;
                }
            }
            var _l = this.low.toString(16);
            var _ld = 8 - _l.length;
            if (_ld > 0) {
                for (i = 0; i < _ld; i++) {
                    _l = '0' + _l;
                }
            }
            this._value = Number('0x' + _h + _l);
            return this._value;
        };
        return Int64;
    })();
    ByteArrayBase.Int64 = Int64;
    var UInt64 = (function () {
        function UInt64(low, high) {
            if (low === void 0) { low = 0; }
            if (high === void 0) { high = 0; }
            this.low = low;
            this.high = high;
        }
        UInt64.prototype.value = function () {
            //this._value = (this.low | (this.high << 32));
            var _h = this.high.toString(16);
            var _hd = 8 - _h.length;
            if (_hd > 0) {
                for (var i = 0; i < _hd; i++) {
                    _h = '0' + _h;
                }
            }
            var _l = this.low.toString(16);
            var _ld = 8 - _l.length;
            if (_ld > 0) {
                for (i = 0; i < _ld; i++) {
                    _l = '0' + _l;
                }
            }
            this._value = Number('0x' + _h + _l);
            return this._value;
        };
        return UInt64;
    })();
    ByteArrayBase.UInt64 = UInt64;
})(ByteArrayBase || (ByteArrayBase = {}));
module.exports = ByteArrayBase;