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
import Fight from "../game/fight/fight"

var arrayBufferToBuffer = require('arraybuffer-to-buffer');
var base64 = require('base64-js');

export default class WorldClient {

    constructor(socket) {
        this.socket = socket;
        this.receive();
        this.socketState = true;
        this.send(new Messages.ProtocolRequiredMessage(Common.DOFUS_PROTOCOL_ID, Common.DOFUS_PROTOCOL_ID));
        this.send(new Messages.HelloGameMessage());
    }

    close() {
        try {
            if(this.socketState) this.socket.end();
        }
        catch (e) {
            Logger.error("Can't disconnect player: " + e);
        }
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
            self.socketState = false;
            self.disconnect();
        });

        this.socket.on('error', function(err){
            self.socketState = false;
            self.disconnect();
        })
    }

    disconnect() {
        var self = this;
        this.socketState = false;
        if(self.character != null) {
            if(self.character.getMap() != null) {
                self.character.getMap().removeClient(self);
            }

            if(self.character.isInFight()) {
                self.character.fight.disconnectFighter(self.character.fighter);
            }
        }
        World.removeClient(self);
        Logger.infos("Client disconnected");
        if (self && self.character)
            self.character.onDisconnect();
    }

    processPart(buffer) {
        var self = this;

        var header = buffer.readShort();
        var messageId = header >> 2;
        var typeLen = header & 3;
        var messageLen = NetworkMessage.getPacketLength(buffer, typeLen);
        Logger.network("Received data (messageId: " + messageId + ", len: " + messageLen + ")");
        var b = arrayBufferToBuffer(buffer.data.buffer);
        var messagePart = b.slice(buffer.position, buffer.position + messageLen);
        Processor.handle(self, messageId, new IO.CustomDataWrapper(Formatter.toArrayBuffer(messagePart)));
        buffer.position = buffer.position + messageLen;
    }

    send(packet) {
        try {
            if(!this.socketState) { return; }
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

            Logger.network("Sended packet '" + packet.constructor.name + "' (id: " + packet.messageId + ", len: " + finalBuffer.length + " -- " + b.length + ")");
        }
        catch (e) {
            Logger.error("Can't send packet to client because: " + e);
        }
    }
}