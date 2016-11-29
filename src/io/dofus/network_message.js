export default class NetworkMessage {

    static BIT_RIGHT_SHIFT_LEN_PACKET_ID = 2;
    static BIT_MASK = 3;

    static writePacket(param1, param2, param3) {
        var _loc5_ = 0;
        var _loc6_ = 0;
        var _loc4_ = this.computeTypeLen(param3.write_position);
        param1.writeShort(this.subComputeStaticHeader(param2, _loc4_));
        switch (_loc4_) {
            case 0:
                return;
            case 1:
                param1.writeByte(param3.write_position);
                break;
            case 2:
                param1.writeShort(param3.write_position);
                break;
            case 3:
                _loc5_ = param3.write_position >> 16 & 255;
                _loc6_ = param3.write_position & 65535;
                param1.writeByte(_loc5_);
                param1.writeShort(_loc6_);
                break;
        }
        var offset = param1._data.write_position;
        param1.writeBytes(param3);
        return offset;
    }

    static computeTypeLen(param1) {
        if (param1 > 65535) {
            return 3;
        }
        if (param1 > 255) {
            return 2;
        }
        if (param1 > 0) {
            return 1;
        }
        return 0;
    }

    static subComputeStaticHeader(param1, param2) {
        return param1 << NetworkMessage.BIT_RIGHT_SHIFT_LEN_PACKET_ID | param2;
    }

    static getPacketLength(buffer, len) {
        var packetLen = 0;
        switch (len)
        {
            case 1:
                packetLen = buffer.readByte();
                break;

            case 2:
                packetLen = buffer.readByte();
                break;

            case 3:
                packetLen = ((buffer.readByte() & 255) << 16) + ((buffer.readByte() & 255) << 8) + (buffer.readByte() & 255);
                break;

            default:
                packetLen = 0;
                break;
        }
        return packetLen;
    }
}