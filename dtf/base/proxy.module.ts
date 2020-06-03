/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import { Module, WebSocket, Cmd, ServerUseModule, Handler } from '../mod.ts';
import { connectWebSocket, WebSocketMessage, WebSocketEvent, isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
//
export class Proxy extends Module {
    //
    protected MsgId: { [index: string]: any } = {
    };
    //
    protected m_queue: Cmd[] = [];
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
        //check queue to send
        setInterval(() => {
            if (this.m_queue.length == 0) {
                return;
            }
            let cmd = this.m_queue.shift() as Cmd;

            client.send(this.m_server.pack(cmd));
        }, 60);
        //
        for await (const msg of client) {
            handler(msg);
        }
    }
    /**
     * 
     * @param ser 
     */
    public init(ser: ServerUseModule) {

        this.m_server = ser;
        this.regServices(this.MsgId);
        this.connectAndServe(this.m_url, async (msg: WebSocketEvent) => {
            if (typeof msg === "string") {
                // console.log(yellow(`< ${msg}`));
                let pack = this.m_server.unPack(msg);
                this.send(pack.id,pack.data,pack.to);
            }

            if (isWebSocketCloseEvent(msg)) {
                // console.log(red(`closed: code=${msg.code}, reason=${msg.reason}`));
            }
        });
    }
    /**
     * 
     * @param msgIds 
     */
    protected regServices(msgIds:any):void{
        this.m_server.addMsgIds(msgIds);
        for(let k in msgIds){
            this.m_server.regHandler(msgIds[k],Handler.create(this,(...args:any[])=>{
                let cmd = args[1];
                this.m_queue.push(cmd);
            }));
        }
        
    }

}