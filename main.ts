/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import { ServerUseModule } from './dtf/base/server.ts'

import{Chat}from './modules/chat.ts';

//
class Server extends ServerUseModule {
    //
    constructor(){
        super();
        this.addModule(Chat);
    }
}
//
let server = new Server();
server.start({
    port: 8000,
});
