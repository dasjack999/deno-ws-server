/********************************************************************************
 *the base interfaces 
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/

import { WebSocket,WebSocketMessage } from "./wserver.ts";
import { Handler } from "./handler.ts";

export{Handler} from "./handler.ts";
//the msg id
export let MsgId: { [index: string]: any } = {
    connect: 1,
    disconnect: 2,
    message: 3,
    max: 99, //system side
};
//
export interface ICmd {
    id: number;
    from: number;
    to: number | number[];
    data?: any;
}

export interface IServer {
    options: any;
    msgIds: { [index: string]: any };
    addMsgIds(msgIds: { [index: string]: any }): void;
    start(options: { port: number }): void;
    stop(): void;
    send(cmd: ICmd): void;
    getClient(cid: number): WebSocket | undefined;
    closeClient(cid: number): void;
    pack(cmd: ICmd): WebSocketMessage;
    unPack(msg: WebSocketMessage): ICmd;
}

export interface IModuleServer extends IServer{
    addModule(...cf:any[]):void;
    regHandler(id: number, handler: Handler): void;
    unRegHandler(id: number, handler: Handler): void;
}
export interface IModule {

    init(ser: IServer): void;
    send(id: number, data: any, to: number | number[], from: number): void;
}

export interface IProxy {

}

