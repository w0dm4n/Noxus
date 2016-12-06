import IO from "../custom_data_wrapper"
import * as Types from "../dofus/types"
import Logger from "../../io/logger"

export class ProtocolMessage {
    constructor(messageId) {
        this.messageId = messageId;
        this.buffer = new IO.CustomDataWrapper();
    }
}

export class ProtocolRequiredMessage extends ProtocolMessage {

    constructor(requiredVersion, currentVersion) {
        super(1);
        this.requiredVersion = requiredVersion;
        this.currentVersion = currentVersion;
    }

    serialize() {
        this.buffer.writeInt(this.requiredVersion);
        this.buffer.writeInt(this.currentVersion);
    }
}

export class RawDataMessage extends ProtocolMessage {

    constructor(content) {
        super(6253);
        this.content = content;
    }

    serialize() {
        this.buffer.writeVarInt(this.content.length);
        for (var i = 0; i < this.content.length; i++) {
            this.buffer.writeByte(this.content[i]);
        }
    }
}

export class IdentificationMessage extends ProtocolMessage {

    constructor() {
        super(4);
    }

    deserialize(buffer) {
        var flag1 = buffer.readByte();
        this.autoconnect = IO.BooleanByteWrapper.getFlag(flag1, 0);
        this.useCertificate = IO.BooleanByteWrapper.getFlag(flag1, 1);
        this.useLoginToken = IO.BooleanByteWrapper.getFlag(flag1, 2);
        this.version = new Types.VersionExtended();
        this.version.deserialize(buffer);
        this.lang = buffer.readUTF();
        var len1 = buffer.readVarUhShort();
        //this.credentials = buffer.readUTF();
        //this.password = buffer.readUTF();
        //this.serverId = buffer.readShort();
    }
}

export class ServerSelectionMessage extends ProtocolMessage {
    constructor() {
        super(40);
    }
    deserialize(buffer) {
        this.serverId = buffer.readVarUhShort();
    }
}

export class SelectedServerDataMessage extends ProtocolMessage {
    constructor(serverId, host, port, canCreateNewCharacter, ticket) {
        super(42);
        this.serverId = serverId;
        this.host = host;
        this.port = port;
        this.canCreateNewCharacter = canCreateNewCharacter;
        this.ticket = ticket;
    }

    serialize() {
        this.buffer.writeVarShort(this.serverId);
        this.buffer.writeUTF(this.host);
        this.buffer.writeShort(this.port);
        this.buffer.writeBoolean(this.canCreateNewCharacter);
        this.buffer.writeUTF(this.ticket);
    }
}

export class IdentificationFailedMessage extends ProtocolMessage {
    constructor(reason) {
        super(20);
        this.reason = reason;
    }

    serialize() {
        this.buffer.writeByte(this.reason);
    }
}



export class NicknameRegistrationMessage extends ProtocolMessage {
    constructor(reason) {
        super(5640);
    }

    serialize() {

    }
}

export class IdentificationSuccessMessage extends ProtocolMessage {
    constructor(login, nickname, accountId, communityId, hasRights, secretQuestion, accountCreation, subscriptionElapsedDuration, subscriptionEndDate, wasAlreadyConnected, havenbagAvailableRoom) {
        super(22);
        this.login = login;
        this.nickname = nickname;
        this.accountId = accountId;
        this.communityId = communityId;
        this.hasRights = hasRights;
        this.secretQuestion = secretQuestion;
        this.accountCreation = accountCreation;
        this.subscriptionElapsedDuration = subscriptionElapsedDuration;
        this.subscriptionEndDate = subscriptionEndDate;
        this.wasAlreadyConnected = wasAlreadyConnected;
        this.havenbagAvailableRoom = havenbagAvailableRoom;
    }
    serialize() {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.hasRights);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.wasAlreadyConnected);
        this.buffer.writeByte(_loc2_);
        this.buffer.writeUTF(this.login);
        this.buffer.writeUTF(this.nickname);
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
        if (this.communityId < 0) {
            Logger.error("Forbidden value (" + this.communityId + ") on element communityId.");
        }
        this.buffer.writeByte(this.communityId);
        this.buffer.writeUTF(this.secretQuestion);
        if (this.accountCreation < 0 || this.accountCreation > 9007199254740990) {
            Logger.error("Forbidden value (" + this.accountCreation + ") on element accountCreation.");
        }
        this.buffer.writeDouble(this.accountCreation);
        if (this.subscriptionElapsedDuration < 0 || this.subscriptionElapsedDuration > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionElapsedDuration + ") on element subscriptionElapsedDuration.");
        }
        this.buffer.writeDouble(this.subscriptionElapsedDuration);
        if (this.subscriptionEndDate < 0 || this.subscriptionEndDate > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionEndDate + ") on element subscriptionEndDate.");
        }
        this.buffer.writeDouble(this.subscriptionEndDate);
        if (this.havenbagAvailableRoom < 0 || this.havenbagAvailableRoom > 255) {
            Logger.error("Forbidden value (" + this.havenbagAvailableRoom + ") on element havenbagAvailableRoom.");
        }
        this.buffer.writeByte(this.havenbagAvailableRoom);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.hasRights = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.wasAlreadyConnected = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.login = buffer.readUTF();
        this.nickname = buffer.readUTF();
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of IdentificationSuccessMessage.accountId.");
        }
        this.communityId = buffer.readByte();
        if (this.communityId < 0) {
            Logger.error("Forbidden value (" + this.communityId + ") on element of IdentificationSuccessMessage.communityId.");
        }
        this.secretQuestion = buffer.readUTF();
        this.accountCreation = buffer.readDouble();
        if (this.accountCreation < 0 || this.accountCreation > 9007199254740990) {
            Logger.error("Forbidden value (" + this.accountCreation + ") on element of IdentificationSuccessMessage.accountCreation.");
        }
        this.subscriptionElapsedDuration = buffer.readDouble();
        if (this.subscriptionElapsedDuration < 0 || this.subscriptionElapsedDuration > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionElapsedDuration + ") on element of IdentificationSuccessMessage.subscriptionElapsedDuration.");
        }
        this.subscriptionEndDate = buffer.readDouble();
        if (this.subscriptionEndDate < 0 || this.subscriptionEndDate > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionEndDate + ") on element of IdentificationSuccessMessage.subscriptionEndDate.");
        }
        this.havenbagAvailableRoom = buffer.readUnsignedByte();
        if (this.havenbagAvailableRoom < 0 || this.havenbagAvailableRoom > 255) {
            Logger.error("Forbidden value (" + this.havenbagAvailableRoom + ") on element of IdentificationSuccessMessage.havenbagAvailableRoom.");
        }
    }
}

export class ServersListMessage extends ProtocolMessage {
    constructor(servers, alreadyConnectedToServerId, canCreateNewCharacter) {
        super(30);
        this.servers = servers;
        this.alreadyConnectedToServerId = alreadyConnectedToServerId;
        this.canCreateNewCharacter = canCreateNewCharacter;
    }

    serialize() {
        this.buffer.writeShort(this.servers.length);
        for (var i in this.servers) {
            this.servers[i].serialize(this.buffer);
        }
        this.buffer.writeVarShort(this.alreadyConnectedToServerId);
        this.buffer.writeBoolean(this.canCreateNewCharacter);
    }
}

export class HelloConnectMessage extends ProtocolMessage {
    constructor(salt, key) {
        super(3);
        this.salt = salt;
        this.key = key;
    }

    serialize() {
        this.buffer.writeUTF(this.salt);
        this.buffer.writeVarInt(this.key);
        for (var i = 0; i < 303; i++) {
            this.buffer.writeByte(i);
        }
    }
}

export class HelloGameMessage extends ProtocolMessage {
    constructor() {
        super(101);
    }
    serialize() {

    }
}

export class AuthenticationTicketMessage extends ProtocolMessage {

    constructor() {
        super(101);
    }
    deserialize(buffer) {
        this.lang = buffer.readUTF();
        this.ticket = buffer.readUTF();
    }
}

export class AuthenticationTicketAcceptedMessage extends ProtocolMessage {

    constructor() {
        super(111);
    }
    serialize() {

    }
}


export class AccountCapabilitiesMessage extends ProtocolMessage {

    constructor(tutorialAvailable, canCreateNewCharacter, accountId, breedsVisible, breedsAvailable, status) {
        super(6216);
        this.tutorialAvailable = tutorialAvailable;
        this.canCreateNewCharacter = canCreateNewCharacter;
        this.accountId = accountId;
        this.breedsVisible = breedsVisible;
        this.breedsAvailable = breedsAvailable;
        this.status = status;
    }
    serialize() {
        var flag1 = 0;
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 0, this.tutorialAvailable);
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 1, this.canCreateNewCharacter);
        this.buffer.writeByte(flag1);
        this.buffer.writeInt(this.accountId);
        this.buffer.writeVarInt(this.breedsVisible);
        this.buffer.writeVarInt(this.breedsAvailable);
        this.buffer.writeByte(this.status);
    }

}

export class TrustStatusMessage extends ProtocolMessage {

    constructor() {
        super(6267);
    }
    serialize() {
        var flag1 = 0;
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 0, true);
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 1, true);
        this.buffer.writeByte(flag1);
    }
}

export class ServerOptionalFeaturesMessage extends ProtocolMessage {
    constructor(features) {
        super(6305);
        this.features = features;
    }
    serialize() {
        this.buffer.writeShort(this.features.length);
        for (var feature in this.features) {
            this.buffer.writeByte(feature);
        }
    }
}

export class ServerSettingsMessage extends ProtocolMessage {
    constructor(lang, community, gameType, arenaLeaveBanTime) {
        super(6340);
        this.lang = lang;
        this.community = community;
        this.gameType = gameType;
        this.arenaLeaveBanTime = arenaLeaveBanTime;
    }
    serialize() {
        this.buffer.writeUTF(this.lang);
        this.buffer.writeByte(this.community);
        this.buffer.writeByte(this.gameType);
        this.buffer.writeVarShort(this.arenaLeaveBanTime);
    }
}


export class BasicCharactersListMessage extends ProtocolMessage {

    constructor(characters) {
        super();
        this.messageId = 6475;
        this.characters = characters;
    }
    serialize() {
        this.buffer.writeShort(this.characters.length);
        for (var i in this.characters) {
            this.buffer.writeShort(this.characters[i].protocolId);
            this.characters[i].serialize(this.buffer);
        }
    }
}

export class CharactersListMessage extends BasicCharactersListMessage {

    constructor(characters) {
        super(characters);
        this.messageId = 151;
    }
    serialize() {
        super.serialize();
        this.buffer.writeBoolean(false);
    }
}



export class CharactersListRequestMessage extends ProtocolMessage {

    constructor() {
        super(150);
    }
    deserialize(buffer) {

    }
}

export class CharacterNameSuggestionRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 162;
    }

    deserialize(buffer) {

    }
}

export class CharacterNameSuggestionSuccessMessage extends ProtocolMessage {
    constructor(suggestion) {
        super();
        this.messageId = 5544;
        this.suggestion = suggestion;
    }

    serialize() {
        this.buffer.writeUTF(this.suggestion);
    }
}

export class CharacterCreationRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 160;
    }

    deserialize(buffer) {
        this.name = buffer.readUTF();
        this.breed = buffer.readByte();
        this.sex = buffer.readBoolean();
        this.colors = [];
        var _loc2_ = 0;
        while (_loc2_ < 5) {
            this.colors[_loc2_] = buffer.readInt();
            _loc2_++;
        }
        this.cosmeticId = buffer.readVarUhShort();
    }
}

export class CharacterCreationResultMessage extends ProtocolMessage {
    constructor(result) {
        super();
        this.messageId = 161;

        this.result = result;
    }

    serialize() {
        this.buffer.writeByte(this.result);
    }
}

export class ReloginTokenRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 6540;
    }

    deserialize(buffer) { }
}

export class CharacterSelectionMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 152;
    }

    deserialize(buffer) {
        this.id = buffer.readVarLong();
    }
}

export class CharacterSelectedSuccessMessage extends ProtocolMessage {
    constructor(character, isCollectingStats) {
        super();
        this.messageId = 153;
        this.character = character;
        this.isCollectingStats = isCollectingStats;
    }

    serialize() {
        this.character.serialize(this.buffer);
        this.buffer.writeBoolean(this.isCollectingStats);
    }
}

export class CharacterLoadingCompleteMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 6471;
    }

    serialize() {

    }
}

export class CharacterCapabilitiesMessage extends ProtocolMessage {
    constructor(guildEmblemSymbolCategories) {
        super();
        this.messageId = 6339;
        this.guildEmblemSymbolCategories = guildEmblemSymbolCategories;
    }

    serialize() {
        this.buffer.writeVarInt(this.guildEmblemSymbolCategories);
    }
}

export class GameContextCreateRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 250;
    }

    deserialize(buffer) { }
}

export class GameContextDestroyMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 201;
    }

    serialize() { }
}

export class GameContextCreateMessage extends ProtocolMessage {
    constructor(context) {
        super();
        this.messageId = 200;

        this.context = context;
    }

    serialize() {
        this.buffer.writeByte(this.context);
    }
}

export class CharacterDeletionRequestMessage extends ProtocolMessage {

    constructor() {
        super();
        this.messageId = 165;
    }

    deserialize(buffer) {
        this.characterId = buffer.readVarLong();
        this.secretAnswerHash = buffer.readUTF();
    }
}

export class CharacterDeletionErrorMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 166;
    }

    serialize() {
        this.buffer.writeByte(this.messageId);
    }
}

export class CurrentMapMessage extends ProtocolMessage {
    constructor(mapId, mapKey) {
        super();
        this.messageId = 220;
        this.mapId = mapId;
        this.mapKey = mapKey;
    }

    serialize() {
        this.buffer.writeInt(this.mapId);
        this.buffer.writeUTF(this.mapKey);
    }
}

export class MapInformationsRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 225;
    }

    deserialize(buffer) {
        this.mapId = buffer.readInt();
    }
}

export class MapComplementaryInformationsDataMessage extends ProtocolMessage {
    constructor(subAreaId, mapId, houses, actors, interactiveElements, statedElements, obstacles, fights, hasAggressiveMonsters) {
        super();
        this.messageId = 226;

        this.subAreaId = subAreaId;
        this.mapId = mapId;
        this.houses = houses;
        this.actors = actors;
        this.interactiveElements = interactiveElements;
        this.statedElements = statedElements;
        this.obstacles = obstacles;
        this.fights = fights;
        this.hasAggressiveMonsters = hasAggressiveMonsters;
    }

    serialize() {
        this.buffer.writeVarShort(this.subAreaId);
        this.buffer.writeInt(this.mapId);
        this.buffer.writeShort(this.houses.length);
        for (house in this.houses) {
            this.buffer.writeShort(this.houses[house]);
        }
        this.buffer.writeShort(this.actors.length);
        for (var actor in this.actors) {
            this.buffer.writeShort(this.actors[actor].protocolId);
            this.actors[actor].serialize(this.buffer);
        }
        this.buffer.writeShort(this.interactiveElements.length);
        for (var interactive in this.interactiveElements) {
            this.buffer.writeShort(this.interactiveElements[interactive].protocolId);
            this.interactiveElements[interactive].serialize(this.buffer);
        }
        this.buffer.writeShort(this.statedElements.length);
        for (element in this.statedElements) {
            this.buffer.writeShort(this.statedElements[element]);
        }
        this.buffer.writeShort(this.obstacles.length);
        for (obstacle in this.obstacles) {
            this.buffer.writeShort(this.obstacles[obstacle]);
        }
        this.buffer.writeShort(this.fights.length);
        for (fight in this.fights) {
            this.buffer.writeShort(this.fights[fight]);
        }
        this.buffer.writeBoolean(this.hasAggressiveMonsters);
    }
}

export class ChatClientPrivateMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 851;
    }

    deserialize(buffer) {
        this.content = buffer.readUTF();
        this.receiver = buffer.readUTF();
    }
}

export class TextInformationMessage extends ProtocolMessage {
    constructor(msgType, msgId, parameters) {
        super();
        this.messageId = 780;
        this.msgType = msgType;
        this.msgId = msgId;
        this.parameters = parameters;
    }

    serialize() {
        this.buffer.writeByte(this.msgType);
        this.buffer.writeVarShort(this.msgId);
        this.buffer.writeShort(this.parameters.length);
        for (var parameter in this.parameters) {
            this.buffer.writeUTF(this.parameters[parameter]);
        }
    }
}

export class ChatAbstractServerMessage extends ProtocolMessage {
    constructor(channel, content, timestamp, fingerprint) {
        super();
        this.messageId = 880;
        this.channel = channel;
        this.content = content;
        this.timestamp = timestamp;
        this.fingerprint = fingerprint;
    }

    serialize() {
        this.buffer.writeByte(this.channel);
        this.buffer.writeUTF(this.content);
        this.buffer.writeInt(this.timestamp);
        this.buffer.writeUTF(this.fingerprint);
    }
}


export class ChatServerMessage extends ChatAbstractServerMessage {
    constructor(channel, content, timestamp, fingerprint, senderId, senderName, senderAccountId) {
        super(channel, content, timestamp, fingerprint);
        this.messageId = 881;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAccountId = senderAccountId;
    }

    serialize() {
        super.serialize();
        this.buffer.writeDouble(this.senderId);
        this.buffer.writeUTF(this.senderName);
        this.buffer.writeInt(this.senderAccountId);
    }
}

export class ChatServerCopyMessage extends ChatAbstractServerMessage {
    constructor(channel, content, timestamp, fingerprint, receiverId, receiverName) {
        super(channel, content, timestamp, fingerprint);
        this.messageId = 882;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
    }

    serialize() {
        super.serialize();
        this.buffer.writeVarLong(this.receiverId);
        this.buffer.writeUTF(this.receiverName);
    }
}

export class ChatClientMultiMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 861;
    }

    deserialize(buffer) {
        this.content = buffer.readUTF();
        this.channel = buffer.readByte();
    }
}

export class GameRolePlayShowActorMessage extends ProtocolMessage {
    constructor(informations) {
        super();
        this.messageId = 5632;
        this.informations = informations;
    }

    serialize() {
        this.buffer.writeShort(this.informations.protocolId);
        this.informations.serialize(this.buffer);
    }
}

export class GameContextRemoveElementMessage extends ProtocolMessage {
    constructor(id) {
        super();
        this.messageId = 251;
        this.id = id;
    }

    serialize() {
        this.buffer.writeDouble(this.id);
    }
}

export class SystemMessageDisplayMessage extends ProtocolMessage {
    constructor(hangUp, msgId, parameters) {
        super(189);
        this.hangUp = hangUp;
        this.msgId = msgId;
        this.parameters = parameters;
    }
    serialize() {
        this.buffer.writeBoolean(this.hangUp);
        if (this.msgId < 0) {
            Logger.error("Forbidden value (" + this.msgId + ") on element msgId.");
        }
        this.buffer.writeVarShort(this.msgId);
        this.buffer.writeShort(this.parameters.length);
        var _loc2_ = 0;
        while (_loc2_ < this.parameters.length) {
            this.buffer.writeUTF(this.parameters[_loc2_]);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        this.hangUp = buffer.readBoolean();
        this.msgId = buffer.readVarUhShort();
        if (this.msgId < 0) {
            Logger.error("Forbidden value (" + this.msgId + ") on element of SystemMessageDisplayMessage.msgId.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUTF();
            this.parameters.push(_loc4_);
            _loc3_++;
        }
    }
}

export class GameMapMovementRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 950;
        this.keyMovements = new Array();
    }

    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc2_ = buffer.readShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readShort();
            this.keyMovements.push(_loc4_);
            _loc3_++;
        }
        this.mapId = buffer.readInt();
    }
}

export class AdminCommandMessage extends ProtocolMessage {
    constructor(content) {
        super(76);
        this.content = content;
    }
    serialize() {
        this.buffer.writeUTF(this.content);
    }
    deserialize(buffer) {
        this.content = buffer.readUTF();
    }
}

export class AdminQuietCommandMessage extends AdminCommandMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5662;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class GameMapMovementMessage extends ProtocolMessage {
    constructor(keyMovements, actorId) {
        super();
        this.messageId = 951;
        this.keyMovements = keyMovements;
        this.actorId = actorId;
    }

    serialize() {
        this.buffer.writeShort(this.keyMovements.length);
        for (var i in this.keyMovements) {
            this.buffer.writeShort(this.keyMovements[i]);
        }
        this.buffer.writeDouble(this.actorId);
    }
}

export class GameMapMovementCancelMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 953;
    }

    deserialize(buffer) {
        this.cellId = buffer.readVarShort();
    }
}

export class GameMapMovementConfirmMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 952;
    }

    deserialize(buffer) {
    }
}

export class ChangeMapMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 221;
    }

    deserialize(buffer) {
        this.mapId = buffer.readInt();
    }
}

export class FriendAddRequestMessage extends ProtocolMessage {
    constructor(name) {
        super(4004);
        this.name = name;
    }
    serialize() {
        this.buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        this.name = buffer.readUTF();
    }
}

export class GameMapChangeOrientationRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 945;
    }

    deserialize(buffer) {
        this.direction = buffer.readByte();
    }
}

export class GameMapChangeOrientationMessage extends ProtocolMessage {
    constructor(orientation) {
        super();
        this.messageId = 946;
        this.orientation = orientation;
    }

    serialize() {
        this.orientation.serialize(this.buffer);
    }
}

export class CharacterStatsListMessage extends ProtocolMessage {
    constructor(stats) {
        super(500);
        this.stats = stats;
    }
    serialize() {
        this.stats.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.stats = new Types.CharacterCharacteristicsInformations();
        this.stats.deserialize(buffer);
    }
}

export class FriendAddFailureMessage extends ProtocolMessage {
    constructor(reason) {
        super(5600);
        this.reason = reason;
    }
    serialize() {
        this.buffer.writeByte(this.reason);
    }
    deserialize(buffer) {
        this.reason = buffer.readByte();
        if (this.reason < 0) {
            Logger.error("Forbidden value (" + this.reason + ") on element of FriendAddFailureMessage.reason.");
        }
    }
}

export class FriendAddedMessage extends ProtocolMessage {
    constructor(friendAdded) {
        super();
        this.messageId = 5599;
        this.friendAdded = friendAdded;
    }
    serialize() {
        this.buffer.writeShort(this.friendAdded.protocolId);
        this.friendAdded.serialize(this.buffer);
    }
}

export class FriendsListMessage extends ProtocolMessage {
    constructor(friendsList) {
        super();
        this.messageId = 4002;
        this.friendsList = friendsList;
    }
    serialize() {
        this.buffer.writeShort(this.friendsList.length);
        var _loc2_ = 0;
        while (_loc2_ < this.friendsList.length) {
            this.buffer.writeShort(this.friendsList[_loc2_].protocolId);
            this.friendsList[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(FriendInformations, _loc4_);
            _loc5_.deserialize(buffer);
            this.friendsList.push(_loc5_);
            _loc3_++;
        }
    }
}

export class StatsUpgradeRequestMessage extends ProtocolMessage {
    constructor(useAdditionnal, statId, boostPoint) {
        super(5610);
        this.useAdditionnal = useAdditionnal;
        this.statId = statId;
        this.boostPoint = boostPoint;
    }
    serialize() {
        this.buffer.writeBoolean(this.useAdditionnal);
        this.buffer.writeByte(this.statId);
        if (this.boostPoint < 0) {
            Logger.error("Forbidden value (" + this.boostPoint + ") on element boostPoint.");
        }
        this.buffer.writeVarShort(this.boostPoint);
    }
    deserialize(buffer) {
        this.useAdditionnal = buffer.readBoolean();
        this.statId = buffer.readByte();
        if (this.statId < 0) {
            Logger.error("Forbidden value (" + this.statId + ") on element of StatsUpgradeRequestMessage.statId.");
        }
        this.boostPoint = buffer.readVarUhShort();
        if (this.boostPoint < 0) {
            Logger.error("Forbidden value (" + this.boostPoint + ") on element of StatsUpgradeRequestMessage.boostPoint.");
        }
    }
}

export class FriendsGetListMessage extends ProtocolMessage {
    constructor() {
        super(4001);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class FriendDeleteRequestMessage extends ProtocolMessage {
    constructor(accountId) {
        super(5603);
        this.accountId = accountId;
    }
    serialize() {
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
    }
    deserialize(buffer) {
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of FriendDeleteRequestMessage.accountId.");
        }
    }
}

export class CharacterLevelUpMessage extends ProtocolMessage {
    constructor(newLevel) {
        super(5670);
        this.newLevel = newLevel;
    }
    serialize() {
        if (this.newLevel < 2 || this.newLevel > 200) {
            Logger.error("Forbidden value (" + this.newLevel + ") on element newLevel.");
        }
        this.buffer.writeByte(this.newLevel);
    }
    deserialize(buffer) {
        this.newLevel = buffer.readUnsignedByte();
        if (this.newLevel < 2 || this.newLevel > 200) {
            Logger.error("Forbidden value (" + this.newLevel + ") on element of CharacterLevelUpMessage.newLevel.");
        }
    }
}

export class EmoteListMessage extends  ProtocolMessage{
constructor(emoteIds) {
super(5689);
this.emoteIds = emoteIds;
}
serialize(){
         this.buffer.writeShort(this.emoteIds.length);
         var _loc2_ =  0;
         while(_loc2_ < this.emoteIds.length)
         {
            if(this.emoteIds[_loc2_] < 0 || this.emoteIds[_loc2_] > 255)
            {
               Logger.error("Forbidden value (" + this.emoteIds[_loc2_] + ") on element 1 (starting at 1) of emoteIds.");
            }
            this.buffer.writeByte(this.emoteIds[_loc2_]);
            _loc2_++;
         }
}
deserialize(buffer){
         var _loc4_ =  0;
         var _loc2_ =  buffer.readUnsignedShort();
         var _loc3_ =  0;
         while(_loc3_ < _loc2_)
         {
            _loc4_ = buffer.readUnsignedByte();
            if(_loc4_ < 0 || _loc4_ > 255)
            {
               Logger.error("Forbidden value (" + _loc4_ + ") on elements of emoteIds.");
            }
            this.emoteIds.push(_loc4_);
            _loc3_++;
         }
}
}

export class FriendSetWarnOnConnectionMessage extends ProtocolMessage {
constructor() {
    super(5602);
}
    deserialize(buffer){
        this.enable = buffer.readBoolean();
    }
}

export class FriendWarnOnConnectionStateMessage extends ProtocolMessage {
    constructor(enable)
    {
        super(5630);
        this.enable = enable;
    }
    serialize()
    {
        this.buffer.writeBoolean(this.enable);
    }
}

export class ChatSmileyRequestMessage extends ProtocolMessage {
    constructor()
    {
        super(800);
    }

    deserialize(buffer)
    {
        this.smileyId = buffer.readVarUhShort();
    }
}

export class ChatSmileyMessage extends ProtocolMessage {
    constructor(entityId, smileyId, accountId) {
        super(801);
        this.entityId = entityId;
        this.smileyId = smileyId;
        this.accountId = accountId;
    }

    serialize() {
        this.buffer.writeDouble(this.entityId);
        this.buffer.writeVarShort(this.smileyId);
        this.buffer.writeInt(this.accountId);
    }
}

export class MoodSmileyRequestMessage extends ProtocolMessage {
    constructor()
    {
        super(6192);
    }

    deserialize(buffer) {
        this.smileyId = buffer.readVarUhShort();
    }
}

export class InventoryWeightMessage extends ProtocolMessage {
    constructor(weight, weightMax) {
        super(3009);
        this.weight = weight;
        this.weightMax = weightMax;
    }
    serialize() {
        if (this.weight < 0) {
            Logger.error("Forbidden value (" + this.weight + ") on element weight.");
        }
        this.buffer.writeVarInt(this.weight);
        if (this.weightMax < 0) {
            Logger.error("Forbidden value (" + this.weightMax + ") on element weightMax.");
        }
        this.buffer.writeVarInt(this.weightMax);
    }
    deserialize(buffer) {
        this.weight = buffer.readVarUhInt();
        if (this.weight < 0) {
            Logger.error("Forbidden value (" + this.weight + ") on element of InventoryWeightMessage.weight.");
        }
        this.weightMax = buffer.readVarUhInt();
        if (this.weightMax < 0) {
            Logger.error("Forbidden value (" + this.weightMax + ") on element of InventoryWeightMessage.weightMax.");
        }
    }
}

export class InventoryContentMessage extends ProtocolMessage {
    constructor(objects, kamas) {
        super(3016);
        this.objects = objects;
        this.kamas = kamas;
    }
    serialize() {
        this.buffer.writeShort(this.objects.length);
        var _loc2_ = 0;
        while (_loc2_ < this.objects.length) {
            this.objects[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element kamas.");
        }
        this.buffer.writeVarInt(this.kamas);
    }
    deserialize(buffer) {
        var _loc4_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new ObjectItem();
            _loc4_.deserialize(buffer);
            this.objects.push(_loc4_);
            _loc3_++;
        }
        this.kamas = buffer.readVarUhInt();
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element of InventoryContentMessage.kamas.");
        }
    }
}
export class TeleportDestinationsListMessage extends ProtocolMessage {
    constructor(teleporterType, mapIds, subAreaIds, costs, destTeleporterType) {
        super(5960);
        this.teleporterType = teleporterType;
        this.mapIds = mapIds;
        this.subAreaIds = subAreaIds;
        this.costs = costs;
        this.destTeleporterType = destTeleporterType;
    }
    serialize() {
        this.buffer.writeByte(this.teleporterType);
        this.buffer.writeShort(this.mapIds.length);
        var _loc2_ = 0;
        while (_loc2_ < this.mapIds.length) {
            if (this.mapIds[_loc2_] < 0) {
                Logger.error("Forbidden value (" + this.mapIds[_loc2_] + ") on element 2 (starting at 1) of mapIds.");
            }
            this.buffer.writeInt(this.mapIds[_loc2_]);
            _loc2_++;
        }
        this.buffer.writeShort(this.subAreaIds.length);
        var _loc3_ = 0;
        while (_loc3_ < this.subAreaIds.length) {
            if (this.subAreaIds[_loc3_] < 0) {
                Logger.error("Forbidden value (" + this.subAreaIds[_loc3_] + ") on element 3 (starting at 1) of subAreaIds.");
            }
            this.buffer.writeVarShort(this.subAreaIds[_loc3_]);
            _loc3_++;
        }
        this.buffer.writeShort(this.costs.length);
        var _loc4_ = 0;
        while (_loc4_ < this.costs.length) {
            if (this.costs[_loc4_] < 0) {
                Logger.error("Forbidden value (" + this.costs[_loc4_] + ") on element 4 (starting at 1) of costs.");
            }
            this.buffer.writeVarShort(this.costs[_loc4_]);
            _loc4_++;
        }
        this.buffer.writeShort(this.destTeleporterType.length);
        var _loc5_ = 0;
        while (_loc5_ < this.destTeleporterType.length) {
            this.buffer.writeByte(this.destTeleporterType[_loc5_]);
            _loc5_++;
        }
    }
}
export class ZaapListMessage extends TeleportDestinationsListMessage {
    constructor(param1, param2, param3, param4, param5, param6) {
        super(param1, param2, param3, param4, param5);
        this.spawnMapId = param6;
        this.messageId = 1604;
    }
    serialize() {
        super.serialize();
        if (this.spawnMapId < 0) {
            Logger.error("Forbidden value (" + this.spawnMapId + ") on element spawnMapId.");
        }
        this.buffer.writeInt(this.spawnMapId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.spawnMapId = buffer.readInt();
        if (this.spawnMapId < 0) {
            Logger.error("Forbidden value (" + this.spawnMapId + ") on element of ZaapListMessage.spawnMapId.");
        }
    }
}
export class InteractiveUseRequestMessage extends ProtocolMessage {
    constructor(elemId, skillInstanceUid) {
        super(5001);
        this.elemId = elemId;
        this.skillInstanceUid = skillInstanceUid;
    }
    serialize() {
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element elemId.");
        }
        this.buffer.writeVarInt(this.elemId);
        if (this.skillInstanceUid < 0) {
            Logger.error("Forbidden value (" + this.skillInstanceUid + ") on element skillInstanceUid.");
        }
        this.buffer.writeVarInt(this.skillInstanceUid);
    }
    deserialize(buffer) {
        this.elemId = buffer.readVarUhInt();
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element of InteractiveUseRequestMessage.elemId.");
        }
        this.skillInstanceUid = buffer.readVarUhInt();
        if (this.skillInstanceUid < 0) {
            Logger.error("Forbidden value (" + this.skillInstanceUid + ") on element of InteractiveUseRequestMessage.skillInstanceUid.");
        }
    }
}
export class InteractiveUsedMessage extends ProtocolMessage {
    constructor(entityId, elemId, skillId, duration, canMove) {
        super(5745);
        this.entityId = entityId;
        this.elemId = elemId;
        this.skillId = skillId;
        this.duration = duration;
        this.canMove = canMove;
    }
    serialize() {
        if (this.entityId < 0 || this.entityId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.entityId + ") on element entityId.");
        }
        this.buffer.writeVarLong(this.entityId);
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element elemId.");
        }
        this.buffer.writeVarInt(this.elemId);
        if (this.skillId < 0) {
            Logger.error("Forbidden value (" + this.skillId + ") on element skillId.");
        }
        this.buffer.writeVarShort(this.skillId);
        if (this.duration < 0) {
            Logger.error("Forbidden value (" + this.duration + ") on element duration.");
        }
        this.buffer.writeVarShort(this.duration);
        this.buffer.writeBoolean(this.canMove);
    }
}
export class InteractiveUseEndedMessage extends ProtocolMessage {
    constructor(elemId, skillId) {
        super(6112);
        this.elemId = elemId;
        this.skillId = skillId;
    }
    serialize() {
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element elemId.");
        }
        this.buffer.writeVarInt(this.elemId);
        if (this.skillId < 0) {
            Logger.error("Forbidden value (" + this.skillId + ") on element skillId.");
        }
        this.buffer.writeVarShort(this.skillId);
    }
}

export class EmoteAddMessage extends ProtocolMessage {
    constructor(emoteId) {
        super(5644);
        this.emoteId = emoteId;
    }
    serialize() {
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        this.buffer.writeByte(this.emoteId);
    }
    deserialize(buffer) {
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of EmoteAddMessage.emoteId.");
        }
    }
}


// Generated by Noxus messages
export class EmotePlayAbstractMessage extends ProtocolMessage {
    constructor(emoteId, emoteStartTime) {
        super(5690);
        this.emoteId = emoteId;
        this.emoteStartTime = emoteStartTime;
    }
    serialize() {
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        this.buffer.writeByte(this.emoteId);
        if (this.emoteStartTime < -9007199254740990 || this.emoteStartTime > 9007199254740990) {
            Logger.error("Forbidden value (" + this.emoteStartTime + ") on element emoteStartTime.");
        }
        this.buffer.writeDouble(this.emoteStartTime);
    }
    deserialize(buffer) {
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of EmotePlayAbstractMessage.emoteId.");
        }
        this.emoteStartTime = buffer.readDouble();
        if (this.emoteStartTime < -9007199254740990 || this.emoteStartTime > 9007199254740990) {
            Logger.error("Forbidden value (" + this.emoteStartTime + ") on element of EmotePlayAbstractMessage.emoteStartTime.");
        }
    }
}

export class EmotePlayRequestMessage extends ProtocolMessage {
    constructor(emoteId) {
        super(5685);
        this.emoteId = emoteId;
    }
    serialize() {
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        this.buffer.writeByte(this.emoteId);
    }
    deserialize(buffer) {
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of EmotePlayRequestMessage.emoteId.");
        }
    }
}

// Generated by Noxus messages
export class EmotePlayMessage extends EmotePlayAbstractMessage{
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.actorId = param3;
        this.accountId = param4;
        this.messageId = 5683;
    }
    serialize() {
        super.serialize();
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element actorId.");
        }
        this.buffer.writeDouble(this.actorId);
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.actorId = buffer.readDouble();
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element of EmotePlayMessage.actorId.");
        }
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of EmotePlayMessage.accountId.");
        }
    }
}

export class ObjectSetPositionMessage extends ProtocolMessage {
    constructor(objectUID, position, quantity) {
        super(3021);
        this.objectUID = objectUID;
        this.position = position;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        this.buffer.writeByte(this.position);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectSetPositionMessage.objectUID.");
        }
        this.position = buffer.readUnsignedByte();
        if (this.position < 0 || this.position > 255) {
            Logger.error("Forbidden value (" + this.position + ") on element of ObjectSetPositionMessage.position.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectSetPositionMessage.quantity.");
        }
    }
}

export class ObjectMovementMessage extends ProtocolMessage {
    constructor(objectUID, position) {
        super(3010);
        this.objectUID = objectUID;
        this.position = position;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        this.buffer.writeByte(this.position);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectMovementMessage.objectUID.");
        }
        this.position = buffer.readUnsignedByte();
        if (this.position < 0 || this.position > 255) {
            Logger.error("Forbidden value (" + this.position + ") on element of ObjectMovementMessage.position.");
        }
    }
}

export class IgnoredAddedMessage extends ProtocolMessage {
    constructor(ignoreAdded, session) {
        super(5678);
        this.ignoreAdded = ignoreAdded;
        this.session = session;
    }
    serialize() {
        this.buffer.writeShort(this.ignoreAdded.protocolId);
        this.ignoreAdded.serialize(this.buffer);
        this.buffer.writeBoolean(this.session);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readUnsignedShort();
        this.ignoreAdded = ProtocolTypeManager.getInstance(IgnoredInformations, _loc2_);
        this.ignoreAdded.deserialize(buffer);
        this.session = buffer.readBoolean();
    }
}

export class IgnoredAddRequestMessage extends ProtocolMessage {
    constructor(name, session) {
        super(5673);
        this.name = name;
        this.session = session;
    }
    serialize() {
        this.buffer.writeUTF(this.name);
        this.buffer.writeBoolean(this.session);
    }
    deserialize(buffer) {
        this.name = buffer.readUTF();
        this.session = buffer.readBoolean();
    }
}

export class IgnoredListMessage extends ProtocolMessage {
    constructor(ignoredList) {
        super(5674);
        this.ignoredList = ignoredList;
    }
    serialize() {
        this.buffer.writeShort(this.ignoredList.length);
        var _loc2_ = 0;
        while (_loc2_ < this.ignoredList.length) {
            this.buffer.writeShort((this.ignoredList[_loc2_]).protocolId);
            this.ignoredList[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(IgnoredInformations, _loc4_);
            _loc5_.deserialize(buffer);
            this.ignoredList.push(_loc5_);
            _loc3_++;
        }
    }
}

export class IgnoredGetListMessage extends ProtocolMessage {
constructor() {
    super(5676);
}
serialize()
{
}
deserialize(buffer){
}
}

export class ObjectDeletedMessage extends ProtocolMessage {
    constructor(objectUID) {
        super(3024);
        this.objectUID = objectUID;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectDeletedMessage.objectUID.");
        }
    }
}

export class IgnoredDeleteRequestMessage extends ProtocolMessage {
    constructor(accountId, session) {
        super(5680);
        this.accountId = accountId;
        this.session = session;
    }
    serialize() {
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
        this.buffer.writeBoolean(this.session);
    }
    deserialize(buffer) {
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of IgnoredDeleteRequestMessage.accountId.");
        }
        this.session = buffer.readBoolean();
    }
}

export class IgnoredDeleteResultMessage extends ProtocolMessage {
    constructor(success, name, session) {
        super(5677);
        this.success = success;
        this.name = name;
        this.session = session;
    }
    serialize() {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.success);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.session);
        this.buffer.writeByte(_loc2_);
        this.buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.success = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.session = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.name = buffer.readUTF();
    }
}

export class GameContextRefreshEntityLookMessage extends ProtocolMessage {
    constructor(id, look) {
        super(5637);
        this.id = id;
        this.look = look;
    }
    serialize() {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        this.buffer.writeDouble(this.id);
        this.look.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of GameContextRefreshEntityLookMessage.id.");
        }
        this.look = new EntityLook();
        this.look.deserialize(buffer);
    }
}

export class BasicNoOperationMessage extends ProtocolMessage {
    constructor() {
        super(176);
    }
    serialize(){
    }
}
export class LeaveDialogRequestMessage extends ProtocolMessage {
    constructor() {
        super(5501);
    }
    serialize(){
    }
    deserialize(buffer){
    }
}
export class LeaveDialogMessage extends ProtocolMessage {
    constructor(dialogType) {
        super(5502);
        this.dialogType = dialogType;
    }
    serialize() {
        this.buffer.writeByte(this.dialogType);
    }
}
export class TeleportRequestMessage extends ProtocolMessage {
    constructor(teleporterType, mapId) {
        super(5961);
        this.teleporterType = teleporterType;
        this.mapId = mapId;
    }
     deserialize(buffer) {
        this.teleporterType = buffer.readByte();
        if (this.teleporterType < 0) {
            Logger.error("Forbidden value (" + this.teleporterType + ") on element of TeleportRequestMessage.teleporterType.");
        }
        this.mapId = buffer.readInt();
        if (this.mapId < 0) {
            Logger.error("Forbidden value (" + this.mapId + ") on element of TeleportRequestMessage.mapId.");
        }
    }
}

export class ObjectDeleteMessage extends ProtocolMessage {
    constructor(objectUID, quantity) {
        super(3022);
        this.objectUID = objectUID;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectDeleteMessage.objectUID.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectDeleteMessage.quantity.");
        }
    }
}

export class ObjectQuantityMessage extends ProtocolMessage {
    constructor(objectUID, quantity) {
        super(3023);
        this.objectUID = objectUID;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectQuantityMessage.objectUID.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectQuantityMessage.quantity.");
        }
    }
}

export class UpdateLifePointsMessage extends ProtocolMessage {
    constructor(lifePoints, maxLifePoints) {
        super(5658);
        this.lifePoints = lifePoints;
        this.maxLifePoints = maxLifePoints;
    }
    serialize() {
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element lifePoints.");
        }
        this.buffer.writeVarInt(this.lifePoints);
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element maxLifePoints.");
        }
        this.buffer.writeVarInt(this.maxLifePoints);
    }
    deserialize(buffer) {
        this.lifePoints = buffer.readVarUhInt();
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element of UpdateLifePointsMessage.lifePoints.");
        }
        this.maxLifePoints = buffer.readVarUhInt();
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element of UpdateLifePointsMessage.maxLifePoints.");
        }
    }
}

export class SetCharacterRestrictionsMessage extends ProtocolMessage {
    constructor(actorId, restrictions) {
        super(170);
        this.actorId = actorId;
        this.restrictions = restrictions;
    }
    serialize() {
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element actorId.");
        }
        this.buffer.writeDouble(this.actorId);
        this.restrictions.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.actorId = buffer.readDouble();
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element of SetCharacterRestrictionsMessage.actorId.");
        }
        this.restrictions = new ActorRestrictionsInformations();
        this.restrictions.deserialize(buffer);
    }
}

export class LifePointsRegenBeginMessage extends ProtocolMessage {
    constructor(regenRate) {
        super(5684);
        this.regenRate = regenRate;
    }
    serialize() {
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element regenRate.");
        }
        this.buffer.writeByte(this.regenRate);
    }
    deserialize(buffer) {
        this.regenRate = buffer.readUnsignedByte();
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element of LifePointsRegenBeginMessage.regenRate.");
        }
    }
}

export class LifePointsRegenEndMessage extends UpdateLifePointsMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.lifePointsGained = param3;
        this.messageId = 5686;
    }
    serialize() {
        super.serialize();
        if (this.lifePointsGained < 0) {
            Logger.error("Forbidden value (" + this.lifePointsGained + ") on element lifePointsGained.");
        }
        this.buffer.writeVarInt(this.lifePointsGained);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.lifePointsGained = buffer.readVarUhInt();
        if (this.lifePointsGained < 0) {
            Logger.error("Forbidden value (" + this.lifePointsGained + ") on element of LifePointsRegenEndMessage.lifePointsGained.");
        }
    }
}

export class ObjectErrorMessage extends ProtocolMessage {
    constructor(reason) {
        super(3004);
        this.reason = reason;
    }
    serialize() {
        this.buffer.writeByte(this.reason);
    }
    deserialize(buffer) {
        this.reason = buffer.readByte();
    }
}

export class PartyInvitationRequestMessage extends ProtocolMessage {
    constructor(name) {
        super(5585);
        this.name = name;
    }
    serialize() {
        this.buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        this.name = buffer.readUTF();
    }
}

export class AbstractPartyMessage extends ProtocolMessage {
    constructor(partyId) {
        super(6274);
        this.partyId = partyId;
    }
    serialize() {
        if (this.partyId < 0) {
            Logger.error("Forbidden value (" + this.partyId + ") on element partyId.");
        }
        this.buffer.writeVarInt(this.partyId);
    }
    deserialize(buffer) {
        this.partyId = buffer.readVarUhInt();
        if (this.partyId < 0) {
            Logger.error("Forbidden value (" + this.partyId + ") on element of AbstractPartyMessage.partyId.");
        }
    }
}

export class PartyInvitationMessage extends AbstractPartyMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7) {
        super(param1);
        this.partyType = param2;
        this.partyName = param3;
        this.maxParticipants = param4;
        this.fromId = param5;
        this.fromName = param6;
        this.toId = param7;
        this.messageId = 5586;
    }
    serialize() {
        super.serialize();
        this.buffer.writeByte(this.partyType);
        this.buffer.writeUTF(this.partyName);
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element maxParticipants.");
        }
        this.buffer.writeByte(this.maxParticipants);
        if (this.fromId < 0 || this.fromId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fromId + ") on element fromId.");
        }
        this.buffer.writeVarLong(this.fromId);
        this.buffer.writeUTF(this.fromName);
        if (this.toId < 0 || this.toId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.toId + ") on element toId.");
        }
        this.buffer.writeVarLong(this.toId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.partyType = buffer.readByte();
        if (this.partyType < 0) {
            Logger.error("Forbidden value (" + this.partyType + ") on element of PartyInvitationMessage.partyType.");
        }
        this.partyName = buffer.readUTF();
        this.maxParticipants = buffer.readByte();
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element of PartyInvitationMessage.maxParticipants.");
        }
        this.fromId = buffer.readVarUhLong();
        if (this.fromId < 0 || this.fromId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fromId + ") on element of PartyInvitationMessage.fromId.");
        }
        this.fromName = buffer.readUTF();
        this.toId = buffer.readVarUhLong();
        if (this.toId < 0 || this.toId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.toId + ") on element of PartyInvitationMessage.toId.");
        }
    }
}

export class AbstractPartyEventMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 6273;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyRefuseInvitationMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5582;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyRefuseInvitationNotificationMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.guestId = param2;
        this.messageId = 5596;
    }
    serialize() {
        super.serialize();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element guestId.");
        }
        this.buffer.writeVarLong(this.guestId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guestId = buffer.readVarUhLong();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element of PartyRefuseInvitationNotificationMessage.guestId.");
        }
    }
}

export class SpellListMessage extends ProtocolMessage {
    constructor(spellPrevisualization, spells) {
        super(1200);
        this.spellPrevisualization = spellPrevisualization;
        this.spells = spells;
    }
    serialize() {
        this.buffer.writeBoolean(this.spellPrevisualization);
        this.buffer.writeShort(this.spells.length);
        var _loc2_ = 0;
        while (_loc2_ < this.spells.length) {
            this.spells[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        this.spellPrevisualization = buffer.readBoolean();
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new SpellItem();
            _loc4_.deserialize(buffer);
            this.spells.push(_loc4_);
            _loc3_++;
        }
    }
}

export class PartyInvitationCancelledForGuestMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.cancelerId = param2;
        this.messageId = 6256;
    }
    serialize() {
        super.serialize();
        if (this.cancelerId < 0 || this.cancelerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.cancelerId + ") on element cancelerId.");
        }
        this.buffer.writeVarLong(this.cancelerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.cancelerId = buffer.readVarUhLong();
        if (this.cancelerId < 0 || this.cancelerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.cancelerId + ") on element of PartyInvitationCancelledForGuestMessage.cancelerId.");
        }
    }
}

export class PartyAcceptInvitationMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5580;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyUpdateMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.memberInformations = param2;
        this.messageId = 5575;
    }
    serialize() {
        super.serialize();
        this.buffer.writeShort(this.memberInformations.protocolId);
        this.memberInformations.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        this.memberInformations = ProtocolTypeManager.getInstance(PartyMemberInformations, _loc2_);
        this.memberInformations.deserialize(buffer);
    }
}

export class PartyNewMemberMessage extends PartyUpdateMessage {
    constructor(param1, param2) {
        super(param1, param2);
        this.messageId = 6306;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyJoinMessage extends AbstractPartyMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8) {
        super(param1);
        this.partyType = param2;
        this.partyLeaderId = param3;
        this.maxParticipants = param4;
        this.members = param5;
        this.guests = param6;
        this.restricted = param7;
        this.partyName = param8;
        this.messageId = 5576;
    }
    serialize() {
        super.serialize();
        this.buffer.writeByte(this.partyType);
        if (this.partyLeaderId < 0 || this.partyLeaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.partyLeaderId + ") on element partyLeaderId.");
        }
        this.buffer.writeVarLong(this.partyLeaderId);
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element maxParticipants.");
        }
        this.buffer.writeByte(this.maxParticipants);
        this.buffer.writeShort(this.members.length);
        var _loc2_ = 0;
        while (_loc2_ < this.members.length) {
            this.buffer.writeShort((this.members[_loc2_]).protocolId);
            this.members[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
        this.buffer.writeShort(this.guests.length);
        var _loc3_ = 0;
        while (_loc3_ < this.guests.length) {
            this.guests[_loc3_].serialize(this.buffer);
            _loc3_++;
        }
        this.buffer.writeBoolean(this.restricted);
        this.buffer.writeUTF(this.partyName);
    }
    deserialize(buffer) {
        var _loc6_ = 0;
        var _loc7_ = null;
        var _loc8_ = null;
        super.deserialize(buffer);
        this.partyType = buffer.readByte();
        if (this.partyType < 0) {
            Logger.error("Forbidden value (" + this.partyType + ") on element of PartyJoinMessage.partyType.");
        }
        this.partyLeaderId = buffer.readVarUhLong();
        if (this.partyLeaderId < 0 || this.partyLeaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.partyLeaderId + ") on element of PartyJoinMessage.partyLeaderId.");
        }
        this.maxParticipants = buffer.readByte();
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element of PartyJoinMessage.maxParticipants.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = buffer.readUnsignedShort();
            _loc7_ = ProtocolTypeManager.getInstance(PartyMemberInformations, _loc6_);
            _loc7_.deserialize(buffer);
            this.members.push(_loc7_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc8_ = new PartyGuestInformations();
            _loc8_.deserialize(buffer);
            this.guests.push(_loc8_);
            _loc5_++;
        }
        this.restricted = buffer.readBoolean();
        this.partyName = buffer.readUTF();
    }
}

export class SpellModifyRequestMessage extends ProtocolMessage {
    constructor(spellId, spellLevel) {
        super(6655);
        this.spellId = spellId;
        this.spellLevel = spellLevel;
    }
    serialize() {
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element spellLevel.");
        }
        this.buffer.writeByte(this.spellLevel);
    }
    deserialize(buffer) {
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of SpellModifyRequestMessage.spellId.");
        }
        this.spellLevel = buffer.readByte();
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element of SpellModifyRequestMessage.spellLevel.");
        }
    }
}

export class SpellModifySuccessMessage extends ProtocolMessage {
    constructor(spellId, spellLevel) {
        super(6654);
        this.spellId = spellId;
        this.spellLevel = spellLevel;
    }
    serialize() {
        this.buffer.writeInt(this.spellId);
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element spellLevel.");
        }
        this.buffer.writeByte(this.spellLevel);
    }
    deserialize(buffer) {
        this.spellId = buffer.readInt();
        this.spellLevel = buffer.readByte();
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element of SpellModifySuccessMessage.spellLevel.");
        }
    }
}

export class GameRolePlayPlayerFightRequestMessage extends ProtocolMessage {
    constructor(targetId, targetCellId, friendly) {
        super(5731);
        this.targetId = targetId;
        this.targetCellId = targetCellId;
        this.friendly = friendly;
    }
    serialize() {
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeVarLong(this.targetId);
        if (this.targetCellId < -1 || this.targetCellId > 559) {
            Logger.error("Forbidden value (" + this.targetCellId + ") on element targetCellId.");
        }
        this.buffer.writeShort(this.targetCellId);
        this.buffer.writeBoolean(this.friendly);
    }
    deserialize(buffer) {
        this.targetId = buffer.readVarLong();
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameRolePlayPlayerFightRequestMessage.targetId.");
        }
        this.targetCellId = buffer.readShort();
        if (this.targetCellId < -1 || this.targetCellId > 559) {
            Logger.error("Forbidden value (" + this.targetCellId + ") on element of GameRolePlayPlayerFightRequestMessage.targetCellId.");
        }
        this.friendly = buffer.readBoolean();
    }
}

export class GameRolePlayPlayerFightFriendlyRequestedMessage extends ProtocolMessage {
    constructor(fightId, sourceId, targetId) {
        super(5937);
        this.fightId = fightId;
        this.sourceId = sourceId;
        this.targetId = targetId;
    }
    serialize() {
        if (this.fightId < 0) {
            Logger.error("Forbidden value (" + this.fightId + ") on element fightId.");
        }
        this.buffer.writeInt(this.fightId);
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element sourceId.");
        }
        this.buffer.writeVarLong(this.sourceId);
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeVarLong(this.targetId);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
        if (this.fightId < 0) {
            Logger.error("Forbidden value (" + this.fightId + ") on element of GameRolePlayPlayerFightFriendlyRequestedMessage.fightId.");
        }
        this.sourceId = buffer.readVarUhLong();
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element of GameRolePlayPlayerFightFriendlyRequestedMessage.sourceId.");
        }
        this.targetId = buffer.readVarUhLong();
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameRolePlayPlayerFightFriendlyRequestedMessage.targetId.");
        }
    }
}

export class GameRolePlayPlayerFightFriendlyAnswerMessage extends ProtocolMessage {
    constructor(fightId, accept) {
        super(5732);
        this.fightId = fightId;
        this.accept = accept;
    }
    serialize() {
        this.buffer.writeInt(this.fightId);
        this.buffer.writeBoolean(this.accept);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
        this.accept = buffer.readBoolean();
    }
}

export class GameRolePlayPlayerFightFriendlyAnsweredMessage extends ProtocolMessage {
    constructor(fightId, sourceId, targetId, accept) {
        super(5733);
        this.fightId = fightId;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.accept = accept;
    }
    serialize() {
        this.buffer.writeInt(this.fightId);
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element sourceId.");
        }
        this.buffer.writeVarLong(this.sourceId);
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeVarLong(this.targetId);
        this.buffer.writeBoolean(this.accept);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
        this.sourceId = buffer.readVarUhLong();
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element of GameRolePlayPlayerFightFriendlyAnsweredMessage.sourceId.");
        }
        this.targetId = buffer.readVarUhLong();
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameRolePlayPlayerFightFriendlyAnsweredMessage.targetId.");
        }
        this.accept = buffer.readBoolean();
    }
}

export class GameFightStartingMessage extends ProtocolMessage {
    constructor(fightType, attackerId, defenderId) {
        super(700);
        this.fightType = fightType;
        this.attackerId = attackerId;
        this.defenderId = defenderId;
    }
    serialize() {
        this.buffer.writeByte(this.fightType);
        if (this.attackerId < -9007199254740990 || this.attackerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.attackerId + ") on element attackerId.");
        }
        this.buffer.writeDouble(this.attackerId);
        if (this.defenderId < -9007199254740990 || this.defenderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.defenderId + ") on element defenderId.");
        }
        this.buffer.writeDouble(this.defenderId);
    }
    deserialize(buffer) {
        this.fightType = buffer.readByte();
        if (this.fightType < 0) {
            Logger.error("Forbidden value (" + this.fightType + ") on element of GameFightStartingMessage.fightType.");
        }
        this.attackerId = buffer.readDouble();
        if (this.attackerId < -9007199254740990 || this.attackerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.attackerId + ") on element of GameFightStartingMessage.attackerId.");
        }
        this.defenderId = buffer.readDouble();
        if (this.defenderId < -9007199254740990 || this.defenderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.defenderId + ") on element of GameFightStartingMessage.defenderId.");
        }
    }
}

export class PartyNewGuestMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.guest = param2;
        this.messageId = 6260;
    }
    serialize() {
        super.serialize();
        this.guest.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guest = new PartyGuestInformations();
        this.guest.deserialize(buffer);
    }
}

export class GameFightJoinMessage extends ProtocolMessage {
    constructor(isTeamPhase, canBeCancelled, canSayReady, isFightStarted, timeMaxBeforeFightStart, fightType) {
        super(702);
        this.isTeamPhase = isTeamPhase;
        this.canBeCancelled = canBeCancelled;
        this.canSayReady = canSayReady;
        this.isFightStarted = isFightStarted;
        this.timeMaxBeforeFightStart = timeMaxBeforeFightStart;
        this.fightType = fightType;
    }
    serialize() {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.isTeamPhase);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.canBeCancelled);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 2, this.canSayReady);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 3, this.isFightStarted);
        this.buffer.writeByte(_loc2_);
        if (this.timeMaxBeforeFightStart < 0) {
            Logger.error("Forbidden value (" + this.timeMaxBeforeFightStart + ") on element timeMaxBeforeFightStart.");
        }
        this.buffer.writeShort(this.timeMaxBeforeFightStart);
        this.buffer.writeByte(this.fightType);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.isTeamPhase = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.canBeCancelled = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.canSayReady = IO.BooleanByteWrapper.getFlag(_loc2_, 2);
        this.isFightStarted = IO.BooleanByteWrapper.getFlag(_loc2_, 3);
        this.timeMaxBeforeFightStart = buffer.readShort();
        if (this.timeMaxBeforeFightStart < 0) {
            Logger.error("Forbidden value (" + this.timeMaxBeforeFightStart + ") on element of GameFightJoinMessage.timeMaxBeforeFightStart.");
        }
        this.fightType = buffer.readByte();
        if (this.fightType < 0) {
            Logger.error("Forbidden value (" + this.fightType + ") on element of GameFightJoinMessage.fightType.");
        }
    }
}

export class PartyLeaveRequestMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5593;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyLeaveMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5594;
    }

    serialize() {
        super.serialize();
    }

    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class GameFightPlacementPossiblePositionsMessage extends ProtocolMessage {
    constructor(positionsForChallengers, positionsForDefenders, teamNumber) {
        super(703);
        this.positionsForChallengers = positionsForChallengers;
        this.positionsForDefenders = positionsForDefenders;
        this.teamNumber = teamNumber;
    }
    serialize() {
        this.buffer.writeShort(this.positionsForChallengers.length);
        var _loc2_ = 0;
        while (_loc2_ < this.positionsForChallengers.length) {
            if (this.positionsForChallengers[_loc2_] < 0 || this.positionsForChallengers[_loc2_] > 559) {
                Logger.error("Forbidden value (" + this.positionsForChallengers[_loc2_] + ") on element 1 (starting at 1) of positionsForChallengers.");
            }
            this.buffer.writeVarShort(this.positionsForChallengers[_loc2_]);
            _loc2_++;
        }
        this.buffer.writeShort(this.positionsForDefenders.length);
        var _loc3_ = 0;
        while (_loc3_ < this.positionsForDefenders.length) {
            if (this.positionsForDefenders[_loc3_] < 0 || this.positionsForDefenders[_loc3_] > 559) {
                Logger.error("Forbidden value (" + this.positionsForDefenders[_loc3_] + ") on element 2 (starting at 1) of positionsForDefenders.");
            }
            this.buffer.writeVarShort(this.positionsForDefenders[_loc3_]);
            _loc3_++;
        }
        this.buffer.writeByte(this.teamNumber);
    }
    deserialize(buffer) {
        var _loc6_ = 0;
        var _loc7_ = 0;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = buffer.readVarUhShort();
            if (_loc6_ < 0 || _loc6_ > 559) {
                Logger.error("Forbidden value (" + _loc6_ + ") on elements of positionsForChallengers.");
            }
            this.positionsForChallengers.push(_loc6_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc7_ = buffer.readVarUhShort();
            if (_loc7_ < 0 || _loc7_ > 559) {
                Logger.error("Forbidden value (" + _loc7_ + ") on elements of positionsForDefenders.");
            }
            this.positionsForDefenders.push(_loc7_);
            _loc5_++;
        }
        this.teamNumber = buffer.readByte();
        if (this.teamNumber < 0) {
            Logger.error("Forbidden value (" + this.teamNumber + ") on element of GameFightPlacementPossiblePositionsMessage.teamNumber.");
        }
    }
}

export class PartyMemberRemoveMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.leavingPlayerId = param2;
        this.messageId = 5579;
    }
    serialize() {
        super.serialize();
        if (this.leavingPlayerId < 0 || this.leavingPlayerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leavingPlayerId + ") on element leavingPlayerId.");
        }
        this.buffer.writeVarLong(this.leavingPlayerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.leavingPlayerId = buffer.readVarUhLong();
        if (this.leavingPlayerId < 0 || this.leavingPlayerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leavingPlayerId + ") on element of PartyMemberRemoveMessage.leavingPlayerId.");
        }
    }
}

export class GameFightShowFighterMessage extends ProtocolMessage {
    constructor(informations) {
        super(5864);
        this.informations = informations;
    }
    serialize() {
        this.buffer.writeShort(this.informations.protocolId);
        this.informations.serialize(this.buffer);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readUnsignedShort();
        this.informations = ProtocolTypeManager.getInstance(GameFightFighterInformations, _loc2_);
        this.informations.deserialize(buffer);
    }
}

export class GameFightPlacementPositionRequestMessage extends ProtocolMessage {
    constructor(cellId) {
        super(704);
        this.cellId = cellId;
    }
    serialize() {
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element cellId.");
        }
        this.buffer.writeVarShort(this.cellId);
    }
    deserialize(buffer) {
        this.cellId = buffer.readVarUhShort();
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element of GameFightPlacementPositionRequestMessage.cellId.");
        }
    }
}

export class GameEntitiesDispositionMessage extends ProtocolMessage {
    constructor(dispositions) {
        super(5696);
        this.dispositions = dispositions;
    }
    serialize() {
        this.buffer.writeShort(this.dispositions.length);
        var _loc2_ = 0;
        while (_loc2_ < this.dispositions.length) {
            this.dispositions[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new IdentifiedEntityDispositionInformations();
            _loc4_.deserialize(buffer);
            this.dispositions.push(_loc4_);
            _loc3_++;
        }
    }
}