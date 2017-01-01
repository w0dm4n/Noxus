export default class BuffRemoveEffect406 {
    static effectId = 406;

    static process(data) {
        for (var t of data.targets) {
            if (t.hasBuffSpell(data.effect.value)) {
                var buff = t.getBuffSpell(data.effect.value);
                if (buff.length > 0) {
                    for(var i of buff){
                        i.remove();
                    }
                }

            }
        }
    }

}
module.exports = BuffRemoveEffect406;