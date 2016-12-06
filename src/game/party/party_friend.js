import PartyType from "../../enums/party_type"
import Party from "../../game/party/party"

export default class PartyFriend extends Party {
    constructor(characterLeader)
    {
        super(PartyType.PARTY_TYPE_CLASSICAL, characterLeader);
    }
}
