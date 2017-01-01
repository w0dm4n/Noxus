var net = require('net');
import Logger from "../io/logger"
import WorldClient from "./world_client"
import * as Messages from "../io/dofus/messages"

export default class WorldServer {

    static clients = [];

    static partys = [];

    static instanciedMaps = [];

    static startTime = null;

    static start(host, port) {
        var server = net.createServer(function(socket) {
            Logger.infos("A new client is connected on the world server");
            var client = new WorldClient(socket);
            WorldServer.clients.push(client);
        });

        try
        {
            server.listen(port, host);
        }
        catch(error)
        {
            Logger.error("Unable to start the auth server : " + error);
        }
        finally
        {
            Logger.infos("World server started on " + host + ":" + port);
            WorldServer.startTime = new Date();
        }
    }

    static removeClient(client){
        var index = WorldServer.clients.indexOf(client);
        if (index != -1) {
            WorldServer.clients.splice(index, 1);
        }
    }

    static sendTextInformationMessageToAll(typeId, id, params) {
        var clients = WorldServer.getAllOnlineClients();
        for (var client of clients) {
            client.send(new Messages.TextInformationMessage(typeId, id, params));
        }
     }


    static getAllOnlineClients()
    {
        var clientsOnline = [];

        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null)
                clientsOnline.push(WorldServer.clients[client]);
        }
        return clientsOnline;
    }

    static getOnlineClientByCharacterName(name)
    {
        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null
             && WorldServer.clients[client].character.name.toLowerCase() == name.toLowerCase())
                return WorldServer.clients[client];
        }
        return null;
    }

    static getOnlineClientByCharacterId(id)
    {
        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null
                && WorldServer.clients[client].character._id == id)
                return WorldServer.clients[client];
        }
        return null;
    }

    static getOnlineClientByNickName(name)
    {
        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null
             && WorldServer.clients[client].account.nickname.toLowerCase() == name.toLowerCase())
                return WorldServer.clients[client];
        }
        return null;
    }

    static sendToAllOnlineClients(message)
    {
        for (var client in WorldServer.clients) {
            if (WorldServer.clients[client].character != null) {
                WorldServer.clients[client].send(message);
            }
        }
    }

    static getOnlineCharacterByAccountId(accountId)
    {
        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null
             && WorldServer.clients[client].account.uid == accountId)
                return WorldServer.clients[client].character;
        }
        return null;
    }

    static getAllClients()
    {
        return WorldServer.clients;
    }

    static getPartyById(id) {
        for (var i in WorldServer.partys) {
            if (WorldServer.partys[i].id == id)
                return WorldServer.partys[i];
        }
        return null;
    }
}