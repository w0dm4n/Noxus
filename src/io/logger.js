require('colors');

export default class Logger {

    static log(color, header, message) {
        console.log("[" + header[color] + "]" + " : " + message.toString().white);
    }

    static infos(message) {
        Logger.log("green", "INFOS", message);
    }

    static error(message) {
        Logger.log("red", "ERROR", message);
    }

    static debug(message) {
        Logger.log("magenta", "DEBUG", message);
    }
}