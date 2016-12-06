import Logger from "../io/logger"

export default class LookManager {


    static parseLook(str) {

        if (!str || str[0] != '{') {
            Logger.infos("Incorrect EntityLook format : " + str);
        }
        var i = 1;
        var num = str.indexOf('|');
        if (num == -1) {
            num = str.indexOf('}');
            if (num == -1) {
                Logger.infos("Incorrect EntityLook format : " + str);
            }
        }


        var bones = parseInt(str.substring(i, num));
        i = num + 1;
        var skins = [];

        if ((num = str.indexOf('|', i)) != -1 || (num = str.indexOf('}', i)) != -1) {
            skins = LookManager.parseCollection(str.substring(i, num));
            i = num + 1;
        }

        if ((num = str.indexOf('|', i)) != -1 || (num = str.indexOf('}', i)) != -1) {
            LookManager.parseCollectionColor(str.substring(i, num));
            i = num + 1;
        }
    }


    static parseCollection(str) {
        var result;
        if (!str) {
            result = [0];
        } else {
            var num = 0;
            var num2 = str.indexOf(',', 0);
            if (num2 == -1) {
                result = [parseInt(str)];
            } else {

                var array = [(str.split(",").length - 1) + 1];
                var num3 = 0;
                while (num2 != -1) {
                    array[num3] = parseInt(str.substring(num, num2));
                    num = num2 + 1;
                    num2 = str.indexOf(',', num);
                    num3++;
                }

                array[num3] = parseInt(str.substring(num, str.Length));
                result = array;
            }
        }
        return result;
    }



    static parseCollectionColor(str) {
        var result;
        if (!str) {
            result = [0];
        } else {
            var num = 0;
            var num2 = str.indexOf(',', 0);
            if (num2 == -1) {
                result = [LookManager.ParseIndexedColor(str)];
            } else {

                var array = [(str.split(",").length - 1) + 1];
                var num3 = 0;
                while (num2 != -1) {
                    array[num3] = LookManager.ParseIndexedColor(str.substring(num, num2));
                    num = num2 + 1;
                    num2 = str.indexOf(',', num);
                    num3++;
                }

                array[num3] = LookManager.ParseIndexedColor(str.substring(num, str.Length));
                result = array;
            }
        }
        return result;
    }

    static ParseIndexedColor(str) {
        var num = str.indexOf("=");
        var flag = str[num + 1] == '#';
        var item = parseInt(str.substring(0, num));
        var item2 = str.split('=')[1];
        console.log("item 1 : " + item);
        console.log("item 2 : " + item2);

    }
}