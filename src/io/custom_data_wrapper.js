import ByteArray from "./bytearray"

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var Binary64 = (function () {
        function Binary64(low, high) {
            if (low === void 0) { low = 0; }
            if (high === void 0) { high = 0; }
            this.high = high;
            this.low = low;
        }
        Binary64.prototype.div = function (n) {
            var modHigh = 0;
            modHigh = (this.high % n);
            var mod = (((this.low % n) + (modHigh * 6)) % n);
            this.high = (this.high / n);
            var newLow = (((modHigh * 4294967296) + this.low) / n);
            this.high = (this.high + Number((newLow / 4294967296)));
            this.low = newLow;
            return mod;
        };
        ;
        Binary64.prototype.mul = function (n) {
            var newLow = (Number(this.low) * n);
            this.high = (this.high * n);
            this.high = (this.high + Number((newLow / 4294967296)));
            this.low = (this.low * n);
        };
        ;
        Binary64.prototype.add = function (n) {
            var newLow = (Number(this.low) + n);
            this.high = (this.high + Number((newLow / 4294967296)));
            this.low = newLow;
        };
        ;
        Binary64.prototype.bitwiseNot = function () {
            this.low = ~(this.low);
            this.high = ~(this.high);
        };
        ;
        Binary64.CHAR_CODE_0 = '0'.charCodeAt(0);
        Binary64.CHAR_CODE_9 = '9'.charCodeAt(0);
        Binary64.CHAR_CODE_A = 'a'.charCodeAt(0);
        Binary64.CHAR_CODE_Z = 'z'.charCodeAt(0);
        return Binary64;
    })();
    var BooleanByteWrapper = (function () {
        function BooleanByteWrapper() {
        }
        BooleanByteWrapper.setFlag = function (param1, param2, param3) {
            switch (param2) {
                case 0:
                    if (param3) {
                        param1 = param1 | 1;
                    }
                    else {
                        param1 = param1 & 255 - 1;
                    }
                    break;
                case 1:
                    if (param3) {
                        param1 = param1 | 2;
                    }
                    else {
                        param1 = param1 & 255 - 2;
                    }
                    break;
                case 2:
                    if (param3) {
                        param1 = param1 | 4;
                    }
                    else {
                        param1 = param1 & 255 - 4;
                    }
                    break;
                case 3:
                    if (param3) {
                        param1 = param1 | 8;
                    }
                    else {
                        param1 = param1 & 255 - 8;
                    }
                    break;
                case 4:
                    if (param3) {
                        param1 = param1 | 16;
                    }
                    else {
                        param1 = param1 & 255 - 16;
                    }
                    break;
                case 5:
                    if (param3) {
                        param1 = param1 | 32;
                    }
                    else {
                        param1 = param1 & 255 - 32;
                    }
                    break;
                case 6:
                    if (param3) {
                        param1 = param1 | 64;
                    }
                    else {
                        param1 = param1 & 255 - 64;
                    }
                    break;
                case 7:
                    if (param3) {
                        param1 = param1 | 128;
                    }
                    else {
                        param1 = param1 & 255 - 128;
                    }
                    break;
                default:
                    throw new Error('Bytebox overflow.');
            }
            return param1;
        };
        BooleanByteWrapper.getFlag = function (param1, param2) {
            switch (param2) {
                case 0:
                    return !((param1 & 1) === 0);
                case 1:
                    return !((param1 & 2) === 0);
                case 2:
                    return !((param1 & 4) === 0);
                case 3:
                    return !((param1 & 8) === 0);
                case 4:
                    return !((param1 & 16) === 0);
                case 5:
                    return !((param1 & 32) === 0);
                case 6:
                    return !((param1 & 64) === 0);
                case 7:
                    return !((param1 & 128) === 0);
                default:
                    throw new Error('Bytebox overflow.');
            }
        };
        return BooleanByteWrapper;
    })();
    var CustomDataWrapper = (function () {
        function CustomDataWrapper(data) {
            if (data instanceof ByteArray) {
                this._data = data;
            }
            else {
                this._data = new ByteArray(data);
            }
        }
        Object.defineProperty(CustomDataWrapper.prototype, "position", {
            get: function () {
                return this._data.position;
            },
            set: function (param1) {
                this._data.position = param1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomDataWrapper.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        CustomDataWrapper.prototype.readVarInt = function () {
            var _loc4_ = 0;
            var _loc1_ = 0;
            var _loc2_ = 0;
            var _loc3_ = false;
            while (_loc2_ < CustomDataWrapper.INT_SIZE) {
                _loc4_ = this._data.readByte();
                _loc3_ = (_loc4_ & CustomDataWrapper.MASK_10000000) === CustomDataWrapper.MASK_10000000;
                if (_loc2_ > 0) {
                    _loc1_ = _loc1_ + ((_loc4_ & CustomDataWrapper.MASK_01111111) << _loc2_);
                }
                else {
                    _loc1_ = _loc1_ + (_loc4_ & CustomDataWrapper.MASK_01111111);
                }
                _loc2_ = _loc2_ + CustomDataWrapper.CHUNCK_BIT_SIZE;
                if (!_loc3_) {
                    return _loc1_;
                }
            }
            throw new Error('Too much data');
        };
        CustomDataWrapper.prototype.readVarUhInt = function () {
            return this.readVarInt();
        };
        CustomDataWrapper.prototype.readVarShort = function () {
            var _loc4_ = 0;
            var _loc1_ = 0;
            var _loc2_ = 0;
            var _loc3_ = false;
            while (_loc2_ < CustomDataWrapper.SHORT_SIZE) {
                _loc4_ = this._data.readByte();
                _loc3_ = (_loc4_ & CustomDataWrapper.MASK_10000000) === CustomDataWrapper.MASK_10000000;
                if (_loc2_ > 0) {
                    _loc1_ = _loc1_ + ((_loc4_ & CustomDataWrapper.MASK_01111111) << _loc2_);
                }
                else {
                    _loc1_ = _loc1_ + (_loc4_ & CustomDataWrapper.MASK_01111111);
                }
                _loc2_ = _loc2_ + CustomDataWrapper.CHUNCK_BIT_SIZE;
                if (!_loc3_) {
                    if (_loc1_ > CustomDataWrapper.SHORT_MAX_VALUE) {
                        _loc1_ = _loc1_ - CustomDataWrapper.UNSIGNED_SHORT_MAX_VALUE;
                    }
                    return _loc1_;
                }
            }
            throw new Error('Too much data');
        };
        CustomDataWrapper.prototype.readVarUhShort = function () {
            return this.readVarShort();
        };
        CustomDataWrapper.prototype.readVarLong = function () {
            return this.readInt64(this._data).toNumber();
        };
        CustomDataWrapper.prototype.readVarUhLong = function () {
            return this.readUInt64(this._data).toNumber();
        };
        CustomDataWrapper.prototype.readBytes = function (param1, param2, param3) {
            if (param2 === void 0) { param2 = 0; }
            if (param3 === void 0) { param3 = 0; }
            this._data.readBytes(param1, param2, param3);
        };
        CustomDataWrapper.prototype.readBoolean = function () {
            return this._data.readBoolean();
        };
        CustomDataWrapper.prototype.readByte = function () {
            return this._data.readByte();
        };
        CustomDataWrapper.prototype.readUnsignedByte = function () {
            return this._data.readUnsignedByte();
        };
        CustomDataWrapper.prototype.readShort = function () {
            return this._data.readShort();
        };
        CustomDataWrapper.prototype.readUnsignedShort = function () {
            return this._data.readUnsignedShort();
        };
        CustomDataWrapper.prototype.readInt = function () {
            return this._data.readInt();
        };
        CustomDataWrapper.prototype.readUnsignedInt = function () {
            return this._data.readUnsignedInt();
        };
        CustomDataWrapper.prototype.readFloat = function () {
            return this._data.readFloat();
        };
        CustomDataWrapper.prototype.readDouble = function () {
            return this._data.readDouble();
        };
        CustomDataWrapper.prototype.readMultiByte = function (param1, param2) {
            return this._data.readMultiByte(param1, param2);
        };
        CustomDataWrapper.prototype.readUTF = function () {
            return this._data.readUTF();
        };
        CustomDataWrapper.prototype.readUTFBytes = function (param1) {
            return this._data.readUTFBytes(param1);
        };
        Object.defineProperty(CustomDataWrapper.prototype, "bytesAvailable", {
            get: function () {
                return this._data.bytesAvailable;
            },
            enumerable: true,
            configurable: true
        });
        CustomDataWrapper.prototype.readObject = function () {
            return this._data.readObject();
        };
        Object.defineProperty(CustomDataWrapper.prototype, "objectEncoding", {
            get: function () {
                return this._data.objectEncoding;
            },
            set: function (param1) {
                this._data.objectEncoding = param1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomDataWrapper.prototype, "endian", {
            get: function () {
                return this._data.endian;
            },
            set: function (param1) {
                this._data.endian = param1;
            },
            enumerable: true,
            configurable: true
        });
        CustomDataWrapper.prototype.writeVarInt = function (param1) {
            var _loc5_ = 0;
            var _loc2_ = new ByteArray();
            if (param1 >= 0 && param1 <= CustomDataWrapper.MASK_01111111) {
                _loc2_.writeByte(param1);
                this._data.writeBytes(_loc2_);
                return;
            }
            var _loc3_ = param1;
            var _loc4_ = new ByteArray();
            while (_loc3_ !== 0) {
                _loc4_.writeByte(_loc3_ & CustomDataWrapper.MASK_01111111);
                _loc4_.position = _loc4_.length - 1;
                _loc5_ = _loc4_.readByte();
                _loc3_ = _loc3_ >>> CustomDataWrapper.CHUNCK_BIT_SIZE;
                if (_loc3_ > 0) {
                    _loc5_ = _loc5_ | CustomDataWrapper.MASK_10000000;
                }
                _loc2_.writeByte(_loc5_);
            }
            this._data.writeBytes(_loc2_);
        };
        CustomDataWrapper.prototype.writeVarShort = function (param1) {
            var _loc5_ = 0;
            if (param1 > CustomDataWrapper.SHORT_MAX_VALUE || param1 < CustomDataWrapper.SHORT_MIN_VALUE) {
                throw new Error('Forbidden value');
            }
            var _loc2_ = new ByteArray();
            if (param1 >= 0 && param1 <= CustomDataWrapper.MASK_01111111) {
                _loc2_.writeByte(param1);
                this._data.writeBytes(_loc2_);
                return;
            }
            var _loc3_ = param1 & 65535;
            var _loc4_ = new ByteArray();
            while (_loc3_ !== 0) {
                _loc4_.writeByte(_loc3_ & CustomDataWrapper.MASK_01111111);
                _loc4_.position = _loc4_.length - 1;
                _loc5_ = _loc4_.readByte();
                _loc3_ = _loc3_ >>> CustomDataWrapper.CHUNCK_BIT_SIZE;
                if (_loc3_ > 0) {
                    _loc5_ = _loc5_ | CustomDataWrapper.MASK_10000000;
                }
                _loc2_.writeByte(_loc5_);
            }
            this._data.writeBytes(_loc2_);
        };
        CustomDataWrapper.prototype.writeVarLong = function (param1) {
            var _loc3_ = 0;
            var _loc2_ = Int64.fromNumber(param1);
            if (_loc2_.high === 0) {
                this.writeint32(this._data, _loc2_.low);
            }
            else {
                _loc3_ = 0;
                while (_loc3_ < 4) {
                    this._data.writeByte(_loc2_.low & 127 | 128);
                    _loc2_.low = _loc2_.low >>> 7;
                    _loc3_++;
                }
                if ((_loc2_.high & 268435455 << 3) === 0) {
                    this._data.writeByte(_loc2_.high << 4 | _loc2_.low);
                }
                else {
                    this._data.writeByte((_loc2_.high << 4 | _loc2_.low) & 127 | 128);
                    this.writeint32(this._data, _loc2_.high >>> 3);
                }
            }
        };
        CustomDataWrapper.prototype.writeBytes = function (param1, param2, param3) {
            if (param2 === void 0) { param2 = 0; }
            if (param3 === void 0) { param3 = 0; }
            this._data.writeBytes(param1, param2, param3);
        };
        CustomDataWrapper.prototype.writeBoolean = function (param1) {
            this._data.writeBoolean(param1);
        };
        CustomDataWrapper.prototype.writeByte = function (param1) {
            this._data.writeByte(param1);
        };
        CustomDataWrapper.prototype.writeSByte = function (param1) {
            this._data.writeByte(param1);
        };
        CustomDataWrapper.prototype.writeShort = function (param1) {
            this._data.writeShort(param1);
        };
        CustomDataWrapper.prototype.writeInt = function (param1) {
            this._data.writeInt(param1);
        };
        CustomDataWrapper.prototype.writeUnsignedInt = function (param1) {
            this._data.writeUnsignedInt(param1);
        };
        CustomDataWrapper.prototype.writeFloat = function (param1) {
            this._data.writeFloat(param1);
        };
        CustomDataWrapper.prototype.writeDouble = function (param1) {
            this._data.writeDouble(param1);
        };
        CustomDataWrapper.prototype.writeMultiByte = function (param1, param2) {
            this._data.writeMultiByte(param1, param2);
        };
        CustomDataWrapper.prototype.writeUTF = function (param1) {
            this._data.writeUTF(param1);
        };
        CustomDataWrapper.prototype.writeUTFBytes = function (param1) {
            this._data.writeUTFBytes(param1);
        };
        CustomDataWrapper.prototype.writeObject = function (param1) {
            this._data.writeObject(param1);
        };
        CustomDataWrapper.prototype.readInt64 = function (param1) {
            var _loc3_ = 0;
            var _loc2_ = new Int64();
            var _loc4_ = 0;
            while (true) {
                _loc3_ = param1.readByte();
                if (_loc4_ === 28) {
                    break;
                }
                if (_loc3_ >= 128) {
                    _loc2_.low = _loc2_.low | (_loc3_ & 127) << _loc4_;
                    _loc4_ = _loc4_ + 7;
                    continue;
                }
                _loc2_.low = _loc2_.low | _loc3_ << _loc4_;
                return _loc2_;
            }
            if (_loc3_ >= 128) {
                _loc3_ = _loc3_ & 127;
                _loc2_.low = _loc2_.low | _loc3_ << _loc4_;
                _loc2_.high = _loc3_ >>> 4;
                _loc4_ = 3;
                while (true) {
                    _loc3_ = param1.readByte();
                    if (_loc4_ < 32) {
                        if (_loc3_ >= 128) {
                            _loc2_.high = _loc2_.high | (_loc3_ & 127) << _loc4_;
                        }
                        else {
                            break;
                        }
                    }
                    _loc4_ = _loc4_ + 7;
                }
                _loc2_.high = _loc2_.high | _loc3_ << _loc4_;
                return _loc2_;
            }
            _loc2_.low = _loc2_.low | _loc3_ << _loc4_;
            _loc2_.high = _loc3_ >>> 4;
            return _loc2_;
        };
        CustomDataWrapper.prototype.readUInt64 = function (param1) {
            var _loc3_ = 0;
            var _loc2_ = new UInt64();
            var _loc4_ = 0;
            while (true) {
                _loc3_ = param1.readUnsignedByte();
                if (_loc4_ === 28) {
                    break;
                }
                if (_loc3_ >= 128) {
                    _loc2_.low = _loc2_.low | (_loc3_ & 127) << _loc4_;
                    _loc4_ = _loc4_ + 7;
                    continue;
                }
                _loc2_.low = _loc2_.low | _loc3_ << _loc4_;
                return _loc2_;
            }
            if (_loc3_ >= 128) {
                _loc3_ = _loc3_ & 127;
                _loc2_.low = _loc2_.low | _loc3_ << _loc4_;
                _loc2_.high = _loc3_ >>> 4;
                _loc4_ = 3;
                while (true) {
                    _loc3_ = param1.readUnsignedByte();
                    if (_loc4_ < 32) {
                        if (_loc3_ >= 128) {
                            _loc2_.high = _loc2_.high | (_loc3_ & 127) << _loc4_;
                        }
                        else {
                            break;
                        }
                    }
                    _loc4_ = _loc4_ + 7;
                }
                _loc2_.high = _loc2_.high | _loc3_ << _loc4_;
                return _loc2_;
            }
            _loc2_.low = _loc2_.low | _loc3_ << _loc4_;
            _loc2_.high = _loc3_ >>> 4;
            return _loc2_;
        };
        CustomDataWrapper.prototype.writeint32 = function (param1, param2) {
            while (param2 >= 128) {
                param1.writeByte(param2 & 127 | 128);
                param2 = param2 >>> 7;
            }
            param1.writeByte(param2);
        };
        CustomDataWrapper.INT_SIZE = 32;
        CustomDataWrapper.SHORT_SIZE = 16;
        CustomDataWrapper.SHORT_MIN_VALUE = -32768;
        CustomDataWrapper.SHORT_MAX_VALUE = 32767;
        CustomDataWrapper.UNSIGNED_SHORT_MAX_VALUE = 65536;
        CustomDataWrapper.CHUNCK_BIT_SIZE = 7;
        CustomDataWrapper.MAX_ENCODING_LENGTH = Math.ceil(CustomDataWrapper.INT_SIZE / CustomDataWrapper.CHUNCK_BIT_SIZE);
        CustomDataWrapper.MASK_10000000 = 128;
        CustomDataWrapper.MASK_01111111 = 127;
        return CustomDataWrapper;
    })();

var Int64 = (function (_super) {
        __extends(Int64, _super);
        function Int64(low, high) {
            if (low === void 0) { low = 0; }
            if (high === void 0) { high = 0; }
            _super.call(this, low, high);
        }
        Int64.fromNumber = function (n) {
            return new Int64(n, Math.floor((n / 4294967296)));
        };
        Int64.prototype.parseInt64 = function (str, radix) {
            radix = radix || 0;
            var digit = 0;
            var negative = (str.search(/^\-/) === 0);
            var i = ((negative) ? 1 : 0);
            if (radix === 0) {
                if (str.search(/^\-?0x/) === 0) {
                    radix = 16;
                    i = (i + 2);
                }
                else {
                    radix = 10;
                }
                ;
            }
            ;
            if ((((radix < 2)) || ((radix > 36)))) {
                throw new Error('ArgumentError');
            }
            ;
            str = str.toLowerCase();
            var result = new Int64();
            while (i < str.length) {
                digit = str.charCodeAt(i);
                if ((((digit >= Binary64.CHAR_CODE_0)) && ((digit <= Binary64.CHAR_CODE_9)))) {
                    digit = (digit - Binary64.CHAR_CODE_0);
                }
                else {
                    if ((((digit >= Binary64.CHAR_CODE_A)) && ((digit <= Binary64.CHAR_CODE_Z)))) {
                        digit = (digit - Binary64.CHAR_CODE_A);
                        digit = (digit + 10);
                    }
                    else {
                        throw new Error('ArgumentError');
                    }
                    ;
                }
                ;
                if (digit >= radix) {
                    throw new Error('ArgumentError');
                }
                ;
                result.mul(radix);
                result.add(digit);
                i++;
            }
            ;
            if (negative) {
                result.bitwiseNot();
                result.add(1);
            }
            ;
            return (result);
        };
        ;
        Int64.prototype.toNumber = function () {
            return (((this.high * 4294967296) + this.low));
        };
        ;
        Int64.prototype.toString = function (radix) {
            radix = radix || 10;
            var _local_4 = 0;
            if ((((radix < 2)) || ((radix > 36)))) {
                throw new Error('ArgumentError');
            }
            ;
            switch (this.high) {
                case 0:
                    return (this.low.toString(radix));
                case -1:
                    if ((this.low & 0x80000000) === 0) {
                        return ((Number((this.low | 0x80000000)) - 0x80000000).toString(radix));
                    }
                    ;
                    return (Number(this.low).toString(radix));
            }
            ;
            if ((((this.low === 0)) && ((this.high === 0)))) {
                return ('0');
            }
            ;
            var digitChars = [];
            var copyOfThis = new Int64(this.low, this.high);
            if (this.high < 0) {
                copyOfThis.bitwiseNot();
                copyOfThis.add(1);
            }
            ;
            do {
                _local_4 = copyOfThis.div(radix);
                if (_local_4 < 10) {
                    digitChars.push((_local_4 + Binary64.CHAR_CODE_0));
                }
                else {
                    digitChars.push(((_local_4 - 10) + Binary64.CHAR_CODE_A));
                }
            } while (copyOfThis.high !== 0);
            if (this.high < 0) {
                return ((('-' + copyOfThis.low.toString(radix)) + String.fromCharCode.apply(String, digitChars.reverse())));
            }
            ;
            return ((copyOfThis.low.toString(radix) + String.fromCharCode.apply(String, digitChars.reverse())));
        };
        ;
        return Int64;
    })(Binary64);

module.exports = {
    CustomDataWrapper: CustomDataWrapper,
    BooleanByteWrapper: BooleanByteWrapper,
    Int64: Int64
}