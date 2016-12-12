export default class Basic {

    static getRandomInt(min, max) {
        return (min - 1) + Math.floor(Math.random() * max + 1);
    }

    static parseLook(look) {
        var look = look.replace('{', '').replace('}', '').split('|');
        return look;
    }

    static getPercentage(val1, val2) {
        return Math.floor((val2 / 100) * val1);
    }
}