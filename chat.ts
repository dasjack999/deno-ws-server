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
  Cmd,
} from "./wserver.ts";
//
export let AppMsgId: { [index: string]: any } = {
  Chat: 100,
  Kickout: 101,




};
//protocl define
export enum ChatChanel{
  local,
  cross,
  world,
  team,
  broadcast
}
//
export interface S2C_Chat{
  channel:number;
  content:string;
}
//
class Server extends WsServer {
  /**
   * 
   * @param msgIds 
   */
  constructor() {
    
    super(AppMsgId);
  }
  /**
   * 
   * @param ws 
   * @param cmd 
   */
  protected onChat(ws: WebSocket, cmd: Cmd): void {
    console.log("chat", cmd.data);
    this.send({
      id: cmd.id,
      from: ws.conn.rid,
      to: cmd.to || 0,
      data: cmd.data,
    });
  }
  /**
   * 
   * @param ws 
   * @param cmd 
   */
  protected onKickout(ws:WebSocket,cmd:Cmd):void{
    

  }
}
//
let server = new Server();
server.start({
  port: 8000,
});
