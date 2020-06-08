/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import {
    WsServer,
    WebSocket,
    WebSocketMessage
} from "./wserver.ts";
import { Handler } from './handler.ts';
import { IModuleServer,IModule } from "./interfaces.ts";

//
export class ModuleServer extends WsServer implements IModuleServer {
    //
    protected m_handlers: { [index: string]: Handler[] } = {};
    /**
     * 
     * @param cf 
     */
    public addModule(...cf:any[]):void{
        cf.forEach((fn)=>{
            let m:IModule = new fn();
            m.init(this);
        });
    }
    /**
     * 
     * @param id 
     * @param handler 
     */
    public regHandler(id: number, handler: Handler): void {
        this.m_handlers[id] = this.m_handlers[id] || [];
        this.m_handlers[id].push(handler);
    }
    /**
     * 
     * @param id 
     * @param handler 
     */
    public unRegHandler(id: number, handler: Handler): void {
        this.m_handlers[id] = this.m_handlers[id] || [];
        let index = this.m_handlers[id].findIndex((v) => {
            return v == handler;
        });
        if (index != -1) {
            this.m_handlers[id].splice(index, 1);
        }
    }
    /**
     *
     */
    protected onMessage(ws: WebSocket, msg: WebSocketMessage): void {
        let cmd = this.unPack(msg);
        cmd.from=ws.conn.rid;
        let handlers = this.m_handlers[cmd.id] || [];
        for (let i = 0, len = handlers.length; i < len; i++) {

            if (handlers[i].runWith([cmd])) {
                break;//stop 
            }
        }
    }
}
