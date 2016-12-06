import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import DBManager from "../database/dbmanager"
import Datacenter from "../database/datacenter"
import ConfigManager from "../utils/configmanager.js"
import CharacterManager from "../managers/character_manager.js"
import IgnoredHandler from "../handlers/ignored_handler"
import Fight from "../game/fight/fight"
import ChallengeFight from "../game/fight/challenge_fight"

export default class FightHandler {

    static handleGameRolePlayPlayerFightRequestMessage(client, packet) {
       var target = client.character.getMap().getClientByCharacterId(packet.targetId);
       if(target) {
           if(target.character.isBusy()) {
               //TODO: Busy
               return;
           }
           if (IgnoredHandler.isIgnoringForSession(target, client.character) && IgnoredHandler.isIgnoring(target, client.account)) {
                //TODO: Messages
               return;
           }
           Logger.debug("Fight request by " + client.character.name + " to " + target.character.name);
           client.character.requestedFight = { source: client.character._id, target: packet.targetId };
           target.character.requestedFight = { source: client.character._id, target: packet.targetId };

           target.send(new Messages.GameRolePlayPlayerFightFriendlyRequestedMessage(1, client.character._id, target.character._id));
           client.send(new Messages.GameRolePlayPlayerFightFriendlyRequestedMessage(1, client.character._id, target.character._id));
       }
    }

    static handleGameRolePlayPlayerFightFriendlyAnswerMessage(client, packet) {
        if(client.character.requestedFight) {
            var target = null;
            if(client.character._id != client.character.requestedFight.source) {
                target = client.character.getMap().getClientByCharacterId(client.character.requestedFight.source);
            }
            else {
                target = client.character.getMap().getClientByCharacterId(client.character.requestedFight.target);
            }
            if(target) {
                if(packet.accept) { // Create a new fight instance
                    client.send(new Messages.GameRolePlayPlayerFightFriendlyAnsweredMessage
                        (1, client.character.requestedFight.source, client.character.requestedFight.target, true));
                    target.send(new Messages.GameRolePlayPlayerFightFriendlyAnsweredMessage
                        (1, target.character.requestedFight.source, target.character.requestedFight.target, true));

                    // Create fight properly
                    var fight = new ChallengeFight(client, target);
                    client.character.fight = fight;
                    target.character.fight = fight;
                    fight.initialize();
                }
                else { // Decline invitation
                    client.send(new Messages.GameRolePlayPlayerFightFriendlyAnsweredMessage
                        (1, client.character.requestedFight.source, client.character.requestedFight.target, false));
                    target.send(new Messages.GameRolePlayPlayerFightFriendlyAnsweredMessage
                        (1, target.character.requestedFight.source, target.character.requestedFight.target, false));
                }
                target.character.requestedFight = null;
            }
            else {
                client.send(new Messages.GameRolePlayPlayerFightFriendlyAnsweredMessage
                    (1, client.character.requestedFight.source, client.character.requestedFight.target, false));
            }
            client.character.requestedFight = null;
        }
    }

    static handleGameFightPlacementPositionRequestMessage(client, packet) {
        if(client.character.isInFight()) {
            Logger.debug("Request fight placement to cellId: " + packet.cellId);
            client.character.fighter.team.fight.requestFightPlacement(client.character.fighter, packet.cellId);
        }
    }
}