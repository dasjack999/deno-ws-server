/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import {Module,WebSocket,Cmd}from '../dtf/mod.ts';

//protocl define
export enum ChatChanel {
    local,
    cross,
    world,
    team,
    broadcast
}
//
export interface S2C_Chat {
    channel: ChatChanel;
    content: string;
    to?:number;
    
}
//
export class Chat extends Module{
    //
    protected MsgId: { [index: string]: any } = {
        Chat: 100,
        Kickout: 101,
        
    
    
    
    };
    /**
     * 
     * @param ws 
     * @param cmd 
     */
    protected onChat(ws: WebSocket, cmd: Cmd): void {
        console.log("chat", cmd.data);
        let sChat:S2C_Chat=cmd.data;
        
        this.send(cmd.id,cmd.data,cmd.to,ws.conn.rid);
      }
      /**
       * 
       * @param ws 
       * @param cmd 
       */
      protected onKickout(ws:WebSocket,cmd:Cmd):void{
        
    
      }
}