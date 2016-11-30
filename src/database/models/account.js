export default class Account {
    
    constructor(raw) {
        this._id = raw._id;
        this.uid = raw.uid;
        this.username = raw.username;
        this.password = raw.password;
        this.scope = raw.scope;
        this.locked = raw.locked;
        this.nickname = raw.nickname;
        this.secret_question = raw.secret_question;
        this.secret_answer = raw.secret_answer;
        this.warnOnConnection = raw.warnOnConnection;
        this.moodSmileyId = raw.moodSmileyId;
    }
}