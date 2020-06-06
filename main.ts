/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import { ModuleServer, Handler } from './dtf/mod.ts'
import { Chat } from './modules/chat.ts';
import { test } from './dtf/base/slave.test.ts';

//
class Server extends ModuleServer {
    //
    constructor() {
        super();
        this.addModule(Chat);
    }
}
//


// for await (const _ of Deno.signal(Deno.Signal.SIGINT)) {
//     console.log("interrupted!");
//     server.stop();
// }



window.addEventListener("load", (e: Event): void => {
    console.log(`got ${e.type} event in event handler (main)`);
    let server = new Server();
    server.start({
        port: 8000,
    });

    test();
});

window.addEventListener("unload", (e: Event): void => {
    console.log(`got ${e.type} event in event handler (main)`);
});

console.log("log from main script");
queueMicrotask(() => {
    console.log('run in microtask')
});