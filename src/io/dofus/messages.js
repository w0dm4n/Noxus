import IO from "../custom_data_wrapper"
import * as Types from "../dofus/types"

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
            this.buffer.writeShort(Types.CharacterBaseInformations.typeId);
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
        for (interactive in this.interactiveElements) {
            this.buffer.writeShort(this.interactiveElements[interactive]);
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