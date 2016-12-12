import ShopDialog from "../../dialog/shop_dialog"
export default class NpcBuySell{
    
    action = 1;

    static execute(character,npc){
        var npc = new ShopDialog(character,npc);
        npc.open();
    }
}