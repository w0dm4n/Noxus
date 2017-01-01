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
import ExchangeHandler from "../handlers/exchange_handler"
import NpcHandler from "../handlers/npc_handler"
import FinishMoveHandler from "../handlers/finish_move_handler"

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
        6225: {message: Messages.ShortcutBarAddRequestMessage, handler: GameHandler.handleShortcutBarAddRequestMessage},
        6230: {message: Messages.ShortcutBarSwapRequestMessage, handler: GameHandler.handleShortcutBarSwapRequestMessage},
        6228: {message: Messages.ShortcutBarRemoveRequestMessage, handler: GameHandler.handleShortcutBarRemoveRequestMessage},

        // Party handler
        5585: { message: Messages.PartyInvitationRequestMessage, handler:PartyHandler.handlePartyInvitationRequestMessage },
        5582: { message: Messages.PartyRefuseInvitationMessage, handler:PartyHandler.handlePartyRefuseInvitationMessage },
        5580: { message: Messages.PartyAcceptInvitationMessage, handler:PartyHandler.handlePartyAcceptInvitationMessage },
        5593: { message: Messages.PartyLeaveRequestMessage, handler:PartyHandler.handlePartyLeaveRequestMessage },
        5592: { message: Messages.PartyKickRequestMessage, handler:PartyHandler.handlePartyKickRequestMessage },
        6080: { message: Messages.PartyAbdicateThroneMessage, handler:PartyHandler.handlePartyAbdicateThroneMessage },
        5577: { message: Messages.PartyFollowMemberRequestMessage, handler:PartyHandler.handlePartyFollowMemberRequestMessage },
        5574: { message: Messages.PartyStopFollowRequestMessage, handler:PartyHandler.handlePartyStopFollowRequestMessage },
        6264: { message: Messages.PartyInvitationDetailsRequestMessage, handler:PartyHandler.handlePartyInvitationDetailsRequestMessage },
        6254: { message: Messages.PartyCancelInvitationMessage, handler:PartyHandler.handlePartyCancelInvitationMessage },

        //Exchange handler
        5773: { message: Messages.ExchangePlayerRequestMessage, handler:ExchangeHandler.handleExchangePlayerRequestMessage },
        5508: { message: Messages.ExchangeAcceptMessage, handler:ExchangeHandler.handleExchangeAcceptMessage },
        5520: { message: Messages.ExchangeObjectMoveKamaMessage, handler:ExchangeHandler.handleExchangeObjectMoveKamaMessage },
        5518: { message: Messages.ExchangeObjectMoveMessage, handler:ExchangeHandler.handleExchangeObjectMoveMessage },
        5511: { message: Messages.ExchangeReadyMessage, handler:ExchangeHandler.handleExchangeReadyMessage },


        //Item handler
        3021: {message: Messages.ObjectSetPositionMessage, handler: ItemHandler.handleObjectSetPositionMessage},
        3022: {message: Messages.ObjectDeleteMessage, handler: ItemHandler.handleObjectDeleteMessage},

        // Spell handler
        6655: {message: Messages.SpellModifyRequestMessage, handler: GameHandler.handleSpellModifyRequestMessage},

        // Fight handler
        5731: {message: Messages.GameRolePlayPlayerFightRequestMessage, handler: FightHandler.handleGameRolePlayPlayerFightRequestMessage},
        5732: {message: Messages.GameRolePlayPlayerFightFriendlyAnswerMessage, handler: FightHandler.handleGameRolePlayPlayerFightFriendlyAnswerMessage},
        704: {message: Messages.GameFightPlacementPositionRequestMessage, handler: FightHandler.handleGameFightPlacementPositionRequestMessage},
        708: {message: Messages.GameFightReadyMessage, handler: FightHandler.handleGameFightReadyMessage},
        701: {message: Messages.GameFightJoinRequestMessage, handler: FightHandler.handleGameFightJoinRequestMessage},
        255: {message: Messages.GameContextQuitMessage, handler: FightHandler.handleGameContextQuitMessage},
        718: {message: Messages.GameFightTurnFinishMessage, handler: FightHandler.handleGameFightTurnFinishMessage},
        1005: {message: Messages.GameActionFightCastRequestMessage, handler: FightHandler.handleGameActionFightCastRequestMessage},
        6081: {message: Messages.GameContextKickMessage, handler: FightHandler.handleGameContextKickMessage},
        6330: { message: Messages.GameActionFightCastOnTargetRequestMessage, handler: FightHandler.handleGameActionFightCastOnTargetRequestMessage },
        6191: { message: Messages.GameRolePlayAttackMonsterRequestMessage, handler: FightHandler.handleGameRolePlayAttackMonsterRequestMessage },

        //Npcs handler
        5898 : {message : Messages.NpcGenericActionRequestMessage , handler : NpcHandler.handleNpcGenericActionRequestMessage },
        5616 : {message : Messages.NpcDialogReplyMessage , handler : NpcHandler.handleNpcDialogReplyMessage },
        5774 : {message : Messages.ExchangeBuyMessage , handler : NpcHandler.handleExchangeBuyMessage },
        5778 : {message : Messages.ExchangeSellMessage , handler : NpcHandler.handleExchangeSellMessage},

        // Finish move handler
        6702 : {message: Messages.FinishMoveListRequestMessage, handler: FinishMoveHandler.handleFinishMoveListRequestMessage },
} 

    static handle(client, messageId, buffer) {
        var handler = Processor.PROTOCOL_HANDLERS[parseInt(messageId)];
        if(handler != null) {
            var packet = new handler.message();
            Logger.network("Process message '" + packet.constructor.name + "'");
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
            client.send(new Messages.BasicNoOperationMessage());
        }
    }

    
}