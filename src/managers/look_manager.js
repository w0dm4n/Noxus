import Logger from "../io/logger"
import SubLookManager from "../managers/sublook_manager.js"
import * as Types from "../io/dofus/types.js"

export default class LookManager {

    constructor(bone,skin,color,scale,sublook){
        this.bones = bone;
        this.skins = skin;
        this.colors = color;
        this.scales = scale;
        this.sublooks = sublook;
    }   
    static toString()
    {
        var str = [];
   
    }

    toEntityLook()
    {
        return new Types.EntityLook(this.bones,this.skins,this.colors,this.scales,this.sublooks);
    }
    
    static parseLook(str) {
        if (!str || str[0] != '{' ) {
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

        var source;
        if ((num = str.indexOf('|', i)) != -1 || (num = str.indexOf('}', i)) != -1) {
            source = LookManager.parseCollectionColor(str.substring(i, num));
            i = num + 1;
        }
        var scales = [];
        if ((num = str.indexOf('|', i)) != -1 || (num = str.indexOf('}', i)) != -1) {

            scales = LookManager.parseCollection(str.substring(i, num));
            i = num + 1;
        }

        var sublook = [];

        while (i < str.length) {
            var num2 = str.indexOf('@', i, 3);
            var num3 = str.indexOf('=', num2 + 1, 3);
            var category = str.substring(i, num2);
            var b = str.substring(num2 + 1, num3);


            var num4 = 0;
            var num5 = num3 + 1;
            var string = [];
            do {
                string.push(str[num5]);
                if (str[num5] == '{') {
                    num4++;
                }
                else {
                    if (str[num5] == '}') {
                        num4--;
                    }
                }
                num5++;
            }
            while (num4 > 0);

            sublook.push(new SubLookManager(b, category, LookManager.parseLook(string.join(""))));
            i = num5 + 1;

        }

         var nextColors = [];
     
            for(var i in source)
            {
                nextColors.push(source[i].item1 << 24 | source[i].item2 & 16777215);
            }

        return new LookManager(bones,skins,nextColors,scales,sublook);

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
        return { item1: item, item2: item2 };

    }
}