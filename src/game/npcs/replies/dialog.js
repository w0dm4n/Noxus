export default class Dialog{

    static execute(character,npc,reply){
        if(reply.param1 != null){
            character.dialog.currentMessage = reply.param1;
            character.dialog.changeMessage();

        }else{
            character.dialog.close();
        }
    }

}