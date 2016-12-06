var net = require('net');
import Logger from "../io/logger"
import AuthClient from "./auth_client"

export default class AuthServer {

    static clients = new Array();
    static clients_tickets = new Array();

    static start(host, port) {
        var server = net.createServer(function(socket) {
            try
            {
                Logger.debug("Connexion d'un client sur le serveur d'authentification");
                var client = new AuthClient(socket);
                AuthServer.clients.push(client);
            }
            catch(error)
            {
                Logger.error("Unable to properly welcome the client");
            }
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
            Logger.infos("Auth server started on " + host + ":" + port);
        }
    }

    static removeClient(client){
        var index = AuthServer.clients.indexOf(client);
        if (index != -1) {
            AuthServer.clients.splice(index, 1);
        }
    }

    static generateTicket(client)
    {
        var crypto = require("crypto");
        var id = crypto.randomBytes(42).toString('hex');
        AuthServer.clients_tickets[id] = client.account;
        return id;
    }

    static getAccountByTicket(ticket)
    {
        var account = AuthServer.clients_tickets[ticket];
        var index = AuthServer.clients_tickets.indexOf(account);
        if (index != -1)
            AuthServer.clients_tickets.splice(index, 1);
        return account;
    }

    static getAllClients()
    {
        return AuthServer.clients;
    }
}