import NetworkMessage from "../io/dofus/network_message"
import IO from "../io/custom_data_wrapper"
import ByteArray from "../io/bytearray"
import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import Common from "../common"
import Formatter from "../utils/formatter"
import Processor from "./processor"
import World from "./world"
import FriendHandler from "../handlers/friend_handler"

var arrayBufferToBuffer = require('arraybuffer-to-buffer');
var base64 = require('base64-js');

export default class WorldClient {

    constructor(socket) {
        this.socket = socket;
        this.receive();
        this.send(new Messages.ProtocolRequiredMessage(Common.DOFUS_PROTOCOL_ID, Common.DOFUS_PROTOCOL_ID));
        this.send(new Messages.HelloGameMessage());
    }

    close() {
        this.socket.end();
    }

    receive() {
        var self = this;
        this.socket.on('data', function(data){
            var buffer = new IO.CustomDataWrapper(Formatter.toArrayBuffer(data));
            while(buffer.bytesAvailable > 0) {
               self.processPart(buffer);
            }
        });

        this.socket.on('end', function(data){
            if(self.character != null) {
                if(self.character.getMap() != null) {
                    self.character.getMap().removeClient(self);
                }
            }
            World.removeClient(self);
            Logger.infos("Client disconnected");
            if (self && self.character)
                self.character.onDisconnect();
        });
    }

    processPart(buffer) {
        var self = this;

        var header = buffer.readShort();
        var messageId = header >> 2;
        var typeLen = header & 3;
        var messageLen = NetworkMessage.getPacketLength(buffer, typeLen);
        Logger.debug("Received data (messageId: " + messageId + ", len: " + messageLen + ")");
        var b = arrayBufferToBuffer(buffer.data.buffer);
        var messagePart = b.slice(buffer.position, buffer.position + messageLen);
        Processor.handle(self, messageId, new IO.CustomDataWrapper(Formatter.toArrayBuffer(messagePart)));
        buffer.position = buffer.position + messageLen;
    }

    send(packet) {
        packet.serialize();
        var messageBuffer = new IO.CustomDataWrapper(new ByteArray());
        var offset = NetworkMessage.writePacket(messageBuffer, packet.messageId, packet.buffer._data);
        var b = arrayBufferToBuffer(messageBuffer.data.buffer);
        if(offset == undefined) {
            offset = 2;
        }
        var finalBuffer = b.slice(0, packet.buffer._data.write_position + offset);
        packet.buffer = new IO.CustomDataWrapper();
        this.socket.write(finalBuffer); 

        Logger.debug("Sended packet '" + packet.constructor.name + "' (id: " + packet.messageId + ", packetlen: " + packet.buffer._data.write_position + ", len: " + finalBuffer.length + " -- " + b.length + ")"); 
    }
}