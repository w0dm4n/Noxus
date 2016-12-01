export default class Basic {

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static parseLook(look) {
        var look = look.replace('{', '').replace('}', '').split('|');
        return look;
    }
}