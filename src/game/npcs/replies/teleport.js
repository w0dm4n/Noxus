import WorldManager from "../../../managers/world_manager"

export default class Teleport {

    static execute(character, npc, reply) {
        if (reply.param1 != null && reply.param2 != null) {

            WorldManager.teleportClient(character.client, reply.param1, reply.param2, function () {
                character.dialog.close();
            });

        } else {
            character.dialog.close();
        }
    }

}