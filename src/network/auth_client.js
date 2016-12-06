import NetworkMessage from "../io/dofus/network_message"
import IO from "../io/custom_data_wrapper"
import ByteArray from "../io/bytearray"
import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import Common from "../common"
import Formatter from "../utils/formatter"
import Processor from "./processor"
import Auth from "./auth"

var arrayBufferToBuffer = require('arraybuffer-to-buffer');
var base64 = require('base64-js')

export default class AuthClient {
 
    constructor(socket) {
        this.socket = socket;
        this.receive();
        this.send(new Messages.ProtocolRequiredMessage(Common.DOFUS_PROTOCOL_ID, Common.DOFUS_PROTOCOL_ID));
        this.send(new Messages.HelloConnectMessage("ivu9wh58^kQQw*8n:jud11Kw(bHY9m3V", 303));
    }

    close() {
        this.socket.end();
    }

    receive() {
        var self = this;
        this.socket.on('data', function(data){
            try {
                var buffer = new IO.CustomDataWrapper(Formatter.toArrayBuffer(data));
                while(buffer.bytesAvailable > 0) {
                    self.processPart(buffer);
                }
            }
            catch (ex) {
                Logger.error("Can't parse properly packet client");
            }
        });

        this.socket.on('end', function(data){
            try {
                Auth.removeClient(self);
                Logger.infos("Client disconnected");
            }
            catch (ex) {
                Logger.error("Can't disconnect properly client");
            }
        });
    }

    processPart(buffer) {
        var self = this;

        var header = buffer.readShort();
        var messageId = header >> 2;
        var typeLen = header & 3;
        var messageLen = NetworkMessage.getPacketLength(buffer, typeLen);
        Logger.debug("Received data (messageId: " + messageId + ", len: " + messageLen + ", real len: " + buffer.data.length + ")");
        var b = arrayBufferToBuffer(buffer.data.buffer);
        var messagePart = null;
        messagePart = b.slice(buffer.position, buffer.position + messageLen);
        Processor.handle(self, messageId, new IO.CustomDataWrapper(Formatter.toArrayBuffer(messagePart)));
        buffer.position = buffer.position + messageLen;
    }

    send(packet) {
        try {
            packet.serialize();
            var messageBuffer = new IO.CustomDataWrapper(new ByteArray());
            var offset = NetworkMessage.writePacket(messageBuffer, packet.messageId, packet.buffer._data);
            var b = arrayBufferToBuffer(messageBuffer.data.buffer);
            if(offset == undefined) {
                offset = 2;
            }
            var finalBuffer = b.slice(0, packet.buffer._data.write_position + offset);
            this.socket.write(finalBuffer);

            Logger.debug("Sended packet '" + packet.constructor.name + "' (id: " + packet.messageId + ", packetlen: " + packet.buffer._data.write_position + ", len: " + finalBuffer.length + " -- " + b.length + ")");
        }
        catch (ex) {
            Logger.error("Can't send properly packet client");
        }
    }
}