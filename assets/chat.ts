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
} from "../dtf/mod.ts";
//
export let MsgId: { [index: string]: any } = {
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
    
    super(MsgId);
  }
  /**
   * 
   * @param ws 
   * @param cmd 
   */
  protected onChat(ws: WebSocket, cmd: Cmd): void {
    console.log("chat", cmd.data);
    this.request(cmd.id,cmd.data,cmd.to,ws.conn.rid);
    // this.send({
    //   id: cmd.id,
    //   from: ws.conn.rid,
    //   to: cmd.to || 0,
    //   data: cmd.data,
    // });
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
