/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import { Module, WebSocket, Cmd, ServerUseModule, Handler } from '../mod.ts';
import { connectWebSocket, WebSocketMessage, WebSocketEvent, isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { WsServer } from '../net/wserver.ts';
//
export class Proxy extends WsServer {
    //
    protected m_queue: WebSocketMessage[] = [];
    //
    protected m_url: string = '';
    //
    protected m_connected: boolean = false;
    /**
     * 
     * @param addr 
     * @param handler 
     */
    protected async connectAndServe(
        addr: string,
        handler: (req: WebSocketEvent) => void,
    ): Promise<void> {
        const client = await connectWebSocket(addr);
        this.m_connected = true;
        console.log('start listen');
        super.start(this.m_options as { port: number });
        //check queue to send
        setInterval(() => {
            if (this.m_queue.length == 0) {
                return;
            }
            let msgOut = this.m_queue.shift() as WebSocketMessage;
            client.send(msgOut);
        }, 60);

        for await (const msg of client) {
            handler(msg);
        }
    }
    /**
   *
   * @param options
   */
    public start(options: { port: number }) {
        this.m_options = options;
        this.connectAndServe(this.m_url, async (msg: WebSocketEvent) => {
            if (typeof msg === "string") {
                // console.log(yellow(`< ${msg}`));
                let pack = this.m_server.unPack(msg);
                this.send(pack);
            }

            if (isWebSocketCloseEvent(msg)) {
                // console.log(red(`closed: code=${msg.code}, reason=${msg.reason}`));
            }


        });


    }
    /**
   *
   */
    protected onMessage(ws: WebSocket, msg: WebSocketMessage): void {
        this.m_queue.push(msg);
    }

}