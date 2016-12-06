import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import CharacterManager from "../../managers/character_manager.js"
import ChatRestrictionManager from "../../managers/chat_restriction_manager.js"
import WorldManager from "../../managers/world_manager.js"
import WorldServer from "../../network/world"
import Logger from "../../io/logger"
import ConfigManager from "../../utils/configmanager.js"
import DBManager from "../../database/dbmanager"
import StatsManager from "../../game/stats/stats_manager"
import ItemBag from "./item_bag"
import Basic from "../../utils/basic"

export default class Character {


    lastSalesMessage = 0;
    lastSeekMessage = 0;
    lastMessage = 0;
    isTemporaryMuted = false;
    firstContext = true;
    client = null;
    ignoredForSession = [];
    ignoredsList = [];
    friends = [];
    party = null;
    dialog = null;

    constructor(raw, creation) {
        var self = this;
        this._id = raw._id;
        this.accountId = raw.accountId;
        this.name = raw.name;
        this.breed = raw.breed;
        this.sex = raw.sex;
        this.colors = raw.colors;
        this.cosmeticId = raw.cosmeticId;
        this.level = raw.level;
        this.experience = raw.experience;
        this.mapid = raw.mapid;
        this.cellid = raw.cellid;
        this.scale = raw.scale;
        this.dirId = raw.dirId;
        this.statsPoints = raw.statsPoints;
        this.spellPoints = raw.spellPoints;
        this.emotes = raw.emotes;
        this.bagId = raw.bagId ? raw.bagId : -1;
        this.skins = [];
        this.zaapSave = raw.zaapSave;
        this.zaapKnows = raw.zaapKnows;
        this.regenTimestamp = Math.floor(Date.now() / 1000);
        this.spells = raw.spells ? raw.spells : [];

        // Bag creation
        if (this.bagId == -1) {
            if (!creation) {
                var bag = new ItemBag();
                this.bindBag(bag);
                this.updateBag();
            }
        }
        else {
            //Get bag by id
            DBManager.getBag(this.bagId, function (bag) {
                if (bag) {
                    var itemBag = new ItemBag();
                    itemBag.fromRaw(bag);
                    self.itemBag = itemBag;
                    self.bindBag(itemBag);
                }
                else {
                    var itemBag = new ItemBag();
                    itemBag.fromRaw(bag);
                    self.bindBag(itemBag);
                    self.updateBag();
                }
            });
        }

        this.stats = [];
        this.statsManager = new StatsManager(this);
        this.statsManager.recalculateStats(raw);

        this.life = raw.life ? raw.life : this.statsManager.getMaxLife();
    }

    onDisconnect() {
        CharacterManager.onDisconnect(this);
    }

    onConnected() {
        CharacterManager.onConnected(this);
    }

    getBaseSkin() {
        return CharacterManager.getDefaultLook(this.breed, this.sex);
    }

    getHeadSkinId() {
        return parseInt(CharacterManager.getHead(this.cosmeticId).skins);
    }

    getBreed() {
        return CharacterManager.getBreed(this.breed);
    }

    getBonesId() {
        return 1;
    }

    regen(life) {
        this.life += life;
        if (this.statsManager.getMaxLife() < this.life) this.life = this.statsManager.getMaxLife();
        this.client.send(new Messages.UpdateLifePointsMessage(this.life, this.statsManager.getMaxLife()));
    }

    getColors() {
        var nextColors = [];
        for (var i = 0; i < this.colors.length; i++) {
            nextColors[i] = i + 1 << 24 | this.colors[i] & 16777215;
        }
        return nextColors;
    }

    refreshEntityLook() {
        var appearenceToShow = [];
        appearenceToShow.push(parseInt(this.getBaseSkin()));
        appearenceToShow.push(parseInt(this.getHeadSkinId()));
        if (this.itemBag) {
            if (this.itemBag.getItemAtPosition(6)) appearenceToShow.push(this.itemBag.getItemAtPosition(6).getTemplate().appearanceId); // Head
            if (this.itemBag.getItemAtPosition(7)) appearenceToShow.push(this.itemBag.getItemAtPosition(7).getTemplate().appearanceId); // Cape
        }
        this.skins = appearenceToShow;
    }

    refreshLookOnMap() {
        if (this.getMap()) {
            this.getMap().send(new Messages.GameContextRefreshEntityLookMessage(this._id, this.getEntityLook()));
        }
    }

    getSubentities() {
        var subentities = [];
        if (this.itemBag) {
            if (this.itemBag.getItemAtPosition(8)) {
                let look = Basic.parseLook(this.itemBag.getItemAtPosition(8).getTemplate().look);
                var entity = new Types.SubEntity(1, 0, new Types.EntityLook
                (parseInt(look[0]), [], [0, 0, 0, 0, 0], [look[3] ? parseInt(look[3]) : 100], []));
                subentities.push(entity);
            }
        }
        return subentities;
    }

    getEntityLook() {
        this.refreshEntityLook();
        return new Types.EntityLook(this.getBonesId(), this.skins,
            this.getColors(), [this.scale], this.getSubentities());
    }

    getCharacterBaseInformations() {
        //return new Types.CharacterBaseInformations(this._id, this.name, this.level, this.getEntityLook(), this.breed, this.sex);
        return new Types.CharacterBaseInformations(this._id, this.name, this.level, this.getEntityLook(), this.breed, this.sex);
    }

    getCharacterRestrictions() {
        return new Types.ActorRestrictionsInformations(false, false, false, false, false, false, false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false);
    }

    getGameRolePlayCharacterInformations(account) {
        return new Types.GameRolePlayCharacterInformations(this._id, this.getEntityLook(), new Types.EntityDispositionInformations(this.cellid, this.dirId),
            this.name, new Types.HumanInformations(this.getCharacterRestrictions(), this.sex, []), account.uid, new Types.ActorAlignmentInformations(0, 0, 0, 0));
    }

    getMap() {
        return WorldManager.getMapInstantly(this.mapid);
    }

    replyText(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, [string]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyError(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, ["<font color=\"#ff0000\">" + string + "</font>"]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyImportant(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, ["<font color=\"#E8890D\">" + string + "</font>"]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyWelcome(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, ["<font color=\"#ffffff\">" + string + "</font>"]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyLangsMessage(typeId, id, params) {
        try {
            this.client.send(new Messages.TextInformationMessage(typeId, id, params));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replySystemMessage(hangup, string) {
        try {
            this.client.send(new Messages.SystemMessageDisplayMessage(hangup, 61, [string]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    canSendSalesMessage() {
        return ChatRestrictionManager.canSendSalesMessages(this) ? true : false;
    }

    updateLastSalesMessage() {
        var time = Date.now || function () {
                return +new Date;
            };
        this.lastSalesMessage = time();
    }

    canSendSeekMessage() {
        return ChatRestrictionManager.canSendSeekMessage(this) ? true : false;
    }

    updateLastSeekMessage() {
        var time = Date.now || function () {
                return +new Date;
            };
        this.lastSeekMessage = time();
    }

    canSendMessage() {
        return ChatRestrictionManager.canSendMessage(this) ? true : false;
    }

    updateLastMessage() {
        var time = Date.now || function () {
                return +new Date;
            };
        this.lastMessage = time();
        this.isTemporaryMuted = false;
    }

    disconnect(reason) {
        if (reason)
            this.client.send(new Messages.SystemMessageDisplayMessage(true, 61, [reason]));
        this.dispose();
    }

    dispose() {
        this.client.close();
    }

    ban(byName, reason) {
        var self = this;
        DBManager.updateAccount(this.client.account.uid, {locked: 1}, function () {
            if (reason)
                self.disconnect("Vous avez été banni par " + byName + ": " + reason);
            else
                self.disconnect("Vous avez été banni par " + byName);
        });
    }

    save(callback) {
        var self = this;
        var toUpdate = {
            mapid: this.mapid,
            cellid: this.cellid,
            dirId: this.dirId,
            level: this.level,
            experience: this.experience,
            statsPoints: this.statsPoints,
            spellPoints: this.spellPoints,
            life: this.life,
            bagId: this.bagId,
            spells: this.spells,
            scale: this.scale,
            stats: {
                strength: this.statsManager.getStatById(10).base,
                vitality: this.statsManager.getStatById(11).base,
                wisdom: this.statsManager.getStatById(12).base,
                chance: this.statsManager.getStatById(13).base,
                agility: this.statsManager.getStatById(14).base,
                intelligence: this.statsManager.getStatById(15).base,
            },
            zaapKnows : this.zaapKnows

        };
        DBManager.updateCharacter(this._id, toUpdate, function () {
            Logger.infos("Character '" + self.name + "(" + self._id + ")' saved");
            if (callback) callback();
        });
    }

    sendEmotesList() {
        CharacterManager.sendEmotesList(this);
    }

    sendWarnOnStateMessages() {
        this.client.send(new Messages.FriendWarnOnConnectionStateMessage(this.client.account.warnOnConnection));
    }

    updateBag() {
        var self = this;
        if (this.bagId == -1) {
            if (this.itemBag != null) {
                this.itemBag.money = ConfigManager.configData.characters_start.kamas;
                this.itemBag.create(function () {
                    self.bindBag(self.itemBag);
                    self.bagId = self.itemBag._id;
                    self.save();
                });
            }
        }
    }

    bindBag(bag) {
        var self = this;
        if (this.itemBag != null) {
            this.itemBag.unbind();
        }
        if (bag == null) return;
        this.itemBag = bag;
        this.itemBag.onItemAdded = function (item) {
            Logger.debug("Item added to character bag");
            self.sendInventoryBag();
        };

        this.itemBag.onItemDeleted = function (item) {
            Logger.debug("Item removed from character bag");
            self.client.send(new Messages.ObjectDeletedMessage(item._id));
            self.sendInventoryBag();
        };

        this.itemBag.onItemUpdated = function (item) {
            Logger.debug("Item updated in character bag");
            self.client.send(new Messages.ObjectQuantityMessage(item._id, item.quantity));
            self.sendInventoryBag();
        };
    }

    sendInventoryBag() {
        if (this.itemBag == null) return;
        this.client.send(new Messages.InventoryWeightMessage(0, 1000));
        this.client.send(new Messages.InventoryContentMessage(this.itemBag.getObjectItemArray(), this.itemBag.money));
    }

    subKamas(amount) {
        this.itemBag.money -= parseInt(amount);
        this.sendInventoryBag();
        this.replyText("Vous avez perdu " + amount + " kamas.");
    }

    addKamas(amount) {
        this.itemBag.money = this.itemBag.money + parseInt(amount);
        this.replyLangsMessage(0, 45, [amount]);
        this.sendInventoryBag();
    }

    isInZaap() {
        if (this.dialog.constructor.name == "ZaapDialog")
            return true;
        else
            return false;
    }

    isInZaapi() {
        if (this.dialog.constructor.name == "ZaapiDialog")
            return true;
        else
            return false;
    }

    setDialog(typedialog) {
        if (this.dialog != null)
            this.dialog.close();

        this.dialog = typedialog;
    }

    closeDialog(typedialog) {
        if (this.dialog == typedialog)
            this.dialog = null;
    }

    leaveDialog() {
        if (this.dialog != null)
            this.dialog.close();

    }

    addSpell(spell) {
        this.spells.push(spell);
        this.save();
    }

    isBusy() {
        if (this.dialog != null)
            return true;
        if(this.requestedFighterId)
            return true;
        return false;
    }

    isInFight() {
        return this.fighter ? true : false;
    }

    getPartyInformations() {
        return new Types.PartyMemberInformations(this._id, this.name, this.level, this.getEntityLook(), this.breed, this.sex, this.life, this.statsManager.getMaxLife(),
            100, 1, 1000, 0, 1, 1, this.mapid, this.getMap().subareaId, new Types.PlayerStatus(0), []);
    }

    getPartyGuestInformations(leaderId) {
        return new Types.PartyGuestInformations(this._id, leaderId, this.name, this.getEntityLook(), this.breed, this.sex, new Types.PlayerStatus(0), []);
    }
}