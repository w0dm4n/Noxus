var net = require('net');
import Logger from "../io/logger"
import WorldClient from "./world_client"

export default class WorldServer {

    static clients = new Array();

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

    static getOnlineClientByNickName(name)
    {
        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null
             && WorldServer.clients[client].character.nickname.toLowerCase() == name.toLowerCase())
                return WorldServer.clients[client];
        }
        return null;
    }

    static sendToAllOnlineClients(message)
    {
        for (var client in WorldServer.clients)
        {
            if (WorldServer.clients[client].character != null)
            {
                WorldServer.clients[client].send(message);
            }
        }
    }

    static getAllClients()
    {
        return WorldServer.clients;
    }
}