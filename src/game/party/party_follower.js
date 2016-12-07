import PartyType from "../../enums/party_type"
import Party from "../../game/party/party"

export default class PartyFollower {
    follower = null;
    followed = null;
    constructor(follower, followed)
    {
        this.follower = follower;
        this.followed = followed;
    }
}
