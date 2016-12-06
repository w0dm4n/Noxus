import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import AuthHandler from "../handlers/auth_handler"
import ApproachHandler from "../handlers/approach_handler"
import GameHandler from "../handlers/game_handler"
import ChatHandler from "../handlers/chat_handler"
import AdminHandler from "../handlers/admin_handler"
import FriendHandler from "../handlers/friend_handler"
import InteractiveHandler from "../handlers/interactive_handler"
import EmoteHandler from "../handlers/emote_handler"
import ItemHandler from "../handlers/item_handler"
import IgnoredHandler from "../handlers/ignored_handler"
import PartyHandler from "../handlers/party_handler"
import FightHandler from "../handlers/fight_handler"

export default class Processor {

    static PROTOCOL_HANDLERS = {
        4: { message: Messages.IdentificationMessage, handler: AuthHandler.handleIdentificationMessage },
        40: { message: Messages.ServerSelectionMessage, handler: AuthHandler.handleServerSelectionMessage },
        110: { message: Messages.AuthenticationTicketMessage, handler: ApproachHandler.handleAuthenticationTicketMessage },
        150: { message: Messages.CharactersListRequestMessage, handler: ApproachHandler.handleCharactersListRequestMessage },
        152: { message: Messages.CharacterSelectionMessage, handler: ApproachHandler.handleCharacterSelectionMessage },
        160: { message: Messages.CharacterCreationRequestMessage, handler: ApproachHandler.handleCharacterCreationRequestMessage },
        162: { message: Messages.CharacterNameSuggestionRequestMessage, handler: ApproachHandler.handleCharacterNameSuggestionRequestMessage },
        250: { message: Messages.GameContextCreateRequestMessage, handler: GameHandler.handleGameContextCreateRequestMessage },
        6540: { message: Messages.ReloginTokenRequestMessage, handler: ApproachHandler.handleReloginTokenRequestMessage },
        165: { message: Messages.CharacterDeletionRequestMessage, handler: ApproachHandler.handleCharacterDeletionRequestMessage },
        225: { message: Messages.MapInformationsRequestMessage, handler: GameHandler.handleMapInformationsRequestMessage },
        851: { message: Messages.ChatClientPrivateMessage, handler: ChatHandler.handleChatClientPrivateMessage },
        861: {message: Messages.ChatClientMultiMessage, handler:ChatHandler.handleChatClientMultiMessage},
        950: {message: Messages.GameMapMovementRequestMessage, handler:GameHandler.handleGameMapMovementRequestMessage},
        5662: {message: Messages.AdminQuietCommandMessage, handler:AdminHandler.handleAdminQuietCommandMessage},
		953: {message: Messages.GameMapMovementCancelMessage, handler: GameHandler.handleGameMapMovementCancelMessage},
		952: {message: Messages.GameMapMovementConfirmMessage, handler: GameHandler.handleGameMapMovementConfirmMessage},
		221: {message: Messages.ChangeMapMessage, handler: GameHandler.handleChangeMapMessage},
        4004: { message: Messages.FriendAddRequestMessage, handler:FriendHandler.handleFriendAddRequestMessage },
        945: { message: Messages.GameMapChangeOrientationRequestMessage, handler:GameHandler.handleGameMapChangeOrientationRequestMessage },
        5610: { message: Messages.StatsUpgradeRequestMessage, handler:GameHandler.handleStatsUpgradeRequestMessage },
        4001: { message: Messages.FriendsGetListMessage, handler:FriendHandler.handleFriendsGetListMessage },
        5603: { message: Messages.FriendDeleteRequestMessage, handler:FriendHandler.handleFriendDeleteRequestMessage },
        5602: { message: Messages.FriendSetWarnOnConnectionMessage, handler:FriendHandler.handleFriendSetWarnOnConnectionMessage },
        800:  { message: Messages.ChatSmileyRequestMessage, handler: GameHandler.handleChatSmileyRequestMessage },
        6192: {message: Messages.MoodSmileyRequestMessage, handler: FriendHandler.handleMoodSmileyRequestMessage },
        5001: {message: Messages.InteractiveUseRequestMessage , handler : InteractiveHandler.parseInteractive},
        5501: {message: Messages.LeaveDialogRequestMessage , handler :InteractiveHandler.leaveInteractive},
        5961: {message: Messages.TeleportRequestMessage , handler :InteractiveHandler.teleportRequest},
        5685: {message: Messages.EmotePlayRequestMessage, handler: EmoteHandler.handleEmotePlayRequestMessage},
        5673: { message: Messages.IgnoredAddRequestMessage, handler:IgnoredHandler.handleIgnoredAddRequestMessage },
        5676: { message: Messages.IgnoredGetListMessage, handler:IgnoredHandler.handleIgnoredGetListMessage },
        5680: { message: Messages.IgnoredDeleteRequestMessage, handler:IgnoredHandler.handleIgnoredDeleteRequestMessage },

        // Party handler
        5585: { message: Messages.PartyInvitationRequestMessage, handler:PartyHandler.handlePartyInvitationRequestMessage },
        5582: { message: Messages.PartyRefuseInvitationMessage, handler:PartyHandler.handlePartyRefuseInvitationMessage },
        5580: { message: Messages.PartyAcceptInvitationMessage, handler:PartyHandler.handlePartyAcceptInvitationMessage },
        5593: { message: Messages.PartyLeaveRequestMessage, handler:PartyHandler.handlePartyLeaveRequestMessage },

        //Item handler
        3021: {message: Messages.ObjectSetPositionMessage, handler: ItemHandler.handleObjectSetPositionMessage},
        3022: {message: Messages.ObjectDeleteMessage, handler: ItemHandler.handleObjectDeleteMessage},

        // Spell handler
        6655: {message: Messages.SpellModifyRequestMessage, handler: GameHandler.handleSpellModifyRequestMessage},

        // Fight handler
        5731: {message: Messages.GameRolePlayPlayerFightRequestMessage, handler: FightHandler.handleGameRolePlayPlayerFightRequestMessage},
        5732: {message: Messages.GameRolePlayPlayerFightFriendlyAnswerMessage, handler: FightHandler.handleGameRolePlayPlayerFightFriendlyAnswerMessage},
        704: {message: Messages.GameFightPlacementPositionRequestMessage, handler: FightHandler.handleGameFightPlacementPositionRequestMessage}
    } 

    static handle(client, messageId, buffer) {
        var handler = Processor.PROTOCOL_HANDLERS[parseInt(messageId)];
        if(handler != null) {
            var packet = new handler.message();
            Logger.debug("Process message '" + packet.constructor.name + "'");
            //try {
                packet.deserialize(buffer);
                handler.handler(client, packet);
            /*}
            catch(ex) {
                Logger.error("Error when process message ..");
                Logger.error(ex);
            }*/
        }
        else {
            Logger.error("Handler not found for messageId: " + messageId);
        }
    }

    
}