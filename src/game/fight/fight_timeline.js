import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import Logger from "../../io/logger"
import WorldManager from "../../managers/world_manager"

export default class FightTimeline {

    static TURN_BASE_TIME = 35;

    constructor(fight) {
        this.fight = fight;
        this.fighters = [];
        this.timer = null;
        this.currentTimelineIndex = -1;
    }

    orderFightersPerInitiative(fighters) {
        fighters.sort(function(a, b) {
            return a.getStats().getTotalStats(16) - b.getStats().getTotalStats(16);
        });
    }

    remixTimeline() {
        var fighterCurrent = null;
        if(this.currentTimelineIndex != -1) {
            fighterCurrent = this.currentFighter();
        }

        Logger.debug("Remix the timeline for the fight id: " + this.fight.id);
        var delta = this.fighters.length;
        this.fighters = [];
        var alter = false;
        var red = this.fight.teams.red.getAliveMembers();
        this.orderFightersPerInitiative(red);
        var blue = this.fight.teams.blue.getAliveMembers();
        this.orderFightersPerInitiative(blue);

        if(blue.length > 0 && red.length > 0) {
            if(blue[0].getStats().getTotalStats(16) > red[0].getStats().getTotalStats(16)) {
                alter = true;
            }

            while(red.length > 0 || blue.length > 0) {
                if(!alter) {
                    if(red.length > 0) {
                        this.fighters.push(red[0]);
                        red.splice(0, 1);
                    }
                }
                else {
                    if(blue.length > 0) {
                        this.fighters.push(blue[0]);
                        blue.splice(0, 1);
                    }
                }
                alter = !alter;
            }

            if(this.currentTimelineIndex != -1) {
                this.resetToFighterIndex(fighterCurrent.id);
            }
        }
    }

    resetToFighterIndex(id) {
        var index = 0;
        for(var i in this.fighters) {
            if(this.fighters[i].id == id) index = i;
        }
        this.currentTimelineIndex = index;
    }

    refreshTimeline() {
        this.remixTimeline();
        var ids = [];
        for(var f of this.fighters) {
            ids.push(f.id);
        }
        this.fight.send(new Messages.GameFightTurnListMessage(ids, []));//TODO: Deads
    }

    currentFighter() {
        return this.fighters[this.currentTimelineIndex];
    }

    anyoneAlive() {
        var aliveCount = 0;
        for(var f of this.fighters) {
            if(f.alive) aliveCount++;
        }
        return aliveCount > 1;
    }

    next() {
        if(this.fighters.length <= 1) {
            this.cancelTimer();
            return;
        }

        this.cancelTimer();
        if(this.currentFighter() != null && this.currentTimelineIndex >= 0) {
            if(this.currentFighter().alive) {
                this.fight.send(new Messages.GameFightTurnEndMessage(this.currentFighter().id));
                this.currentFighter().resetPoints();
                this.currentFighter().refreshStats();
            }
        }

        this.currentTimelineIndex++;
        if(this.currentTimelineIndex > this.fighters.length - 1) {
            this.currentTimelineIndex = 0;
        }

        if(this.currentFighter().alive) {
            this.currentFighter().beginTurn();
            this.fight.send(new Messages.GameFightTurnReadyRequestMessage(this.currentFighter().id));
            this.fight.send(new Messages.GameFightTurnStartMessage(this.currentFighter().id, FightTimeline.TURN_BASE_TIME * 10));
            this.fight.synchronizeFight();
            this.fight.send(new Messages.GameFightTurnStartPlayingMessage());
            this.startTimer();
        }
        else {
            if(this.anyoneAlive()) {
                this.next();
            }
        }
    }

    cancelTimer() {
        if(this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    startTimer() {
        var self = this;
        this.timer = setTimeout(function(){
            self.next();
        }, FightTimeline.TURN_BASE_TIME * 1000);
    }
}