/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import {
  ServerRequest,
  HTTPOptions,
  serve,
  Server,
} from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  acceptable,
  WebSocket,
  isWebSocketCloseEvent,
  WebSocketMessage,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
  WebSocketEvent,
} from "https://deno.land/std/ws/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
//the msg id
export let MsgId: { [index: string]: any } = {
  connect: 1,
  disconnect: 2,
  message: 3,
  max: 99, //system side
};
//
export interface Cmd {
  id: number;
  from: number;
  to: number | number[];
  data?: any;
}
//
export { WebSocket, WebSocketMessage } from "https://deno.land/std/ws/mod.ts";
//////////////////////////////////////////////////////////////////////////////////////
//
//author:jack liu
/////////////////////////////////////////////////////////////////////////////////////
export class WsServer {
  //
  protected m_server: any;
  //
  private m_enableFilter: boolean = true;
  //
  protected m_stopped: boolean = false;
  //
  protected m_options: {} = {};
  //
  protected m_clients: Map<number, WebSocket> = new Map<number, WebSocket>();
  /**
   *
   * @param msgIds
   */
  constructor(msgIds?: { [index: string]: any }) {
    this.addMsgIds(MsgId);
    if (msgIds) {
      this.addMsgIds(msgIds);
    }
  }
  /**
   * 
   */
  public get options(): any {
    return this.m_options;
  }
  /**
   * 
   */
  public get msgIds(): { [index: string]: any } {
    return MsgId;
  }
  /**
   * 
   * @param msgIds 
   */
  public addMsgIds(msgIds: { [index: string]: any }) {
    for (let k in msgIds) {
      Object.defineProperty(MsgId, msgIds[k], {
        value: k,
        writable: false,
      });
    }
  }
  /**
   *
   * @param options
   */
  public start(options: { port: number }): void {
    this.m_options = parse(Deno.args);
    console.dir("got args", this.m_options);
    this.m_options = Object.assign({}, this.m_options, options);
    this.stop();
    this.m_stopped = false;
    console.log("chat server starting on :", JSON.stringify(this.m_options));
    //
    this.listenAndServe(options, async (req: ServerRequest) => {
      if (req.method === "GET" && req.url === "/ws") {
        if (acceptable(req)) {
          let client = await acceptWebSocket({
            conn: req.conn,
            bufReader: req.r,
            bufWriter: req.w,
            headers: req.headers,
          });
          this.handleClient(client);
        }
      }
    });
  }
  /**
   *
   */
  public stop(): void {
    // let clients = this.m_clients.values();
    // for (const client of clients) {
    //   client.close();
    // }
    this.m_stopped = true;
    this.m_clients.clear();
    if (this.m_server) {
      let ser = this.m_server as Server;
      ser.close();
    }
  }
  /**
     *
     */
  public send(cmd: Cmd): void {
    //system flag
    if (cmd.to < 0) {
      return;
    }
    //get json by default
    let to = cmd.to;
    if (this.m_enableFilter) {
      delete cmd.to;
      delete cmd.from;
    }
    let msg = this.pack(cmd);
    //send to someones
    if (to) {
      let arr = to as number[];
      if (!Array.isArray(to)) {
        arr = [to];
      }
      for (let i = 0, len = arr.length; i < len; i++) {
        const client = this.m_clients.get(arr[i]);
        if (client) {
          if (client.isClosed) {
            console.log("send err closed", client.conn.rid);
            this.m_clients.delete(client.conn.rid);
          } else {
            client.send(msg);
          }
        }
      }
    } else {
      //broadcast
      let clients = this.m_clients.values();
      for (const client of clients) {
        if (client.isClosed) {
          console.log("send err closed", client.conn.rid);
          this.m_clients.delete(client.conn.rid);
        } else {
          client.send(msg);
        }
      }
    }
  }
  /**
   *
   * @param cmd
   */
  public getClient(cid: number): WebSocket | undefined {
    return this.m_clients.get(cid);
  }
  /**
   *
   * @param cmd
   */
  public closeClient(cid: number): void {
    let client = this.getClient(cid);
    if (client) {
      client.close();
    }
  }
  /**
   * 
   * @param addr 
   * @param handler 
   */
  protected async listenAndServe(
    addr: string | HTTPOptions,
    handler: (req: ServerRequest) => void,
  ): Promise<void> {
    const server = serve(addr);
    this.m_server = server;
    for await (const request of server) {
      if (this.m_stopped) {
        break;
      }
      handler(request);
    }
  }
  /**
   * 
   */
  protected set enableFilter(enable: boolean) {
    this.m_enableFilter = enable;
  }
  /**
   *
   * @param ws
   */
  public pack(cmd: Cmd): WebSocketMessage {
    return JSON.stringify(cmd);
  }
  /**
   *
   * @param ws
   */
  public unPack(msg: WebSocketMessage): Cmd {
    return JSON.parse(msg as string);
  }
  /**
   *
   */
  protected async handleClient(ws: WebSocket): Promise<void> {
    const id = ws.conn.rid;
    this.m_clients.set(id, ws);

    console.log("connect from ", ws.conn.rid);
    this.onConnected(ws);

    for await (const msg of ws) {
      console.log(`from:${ws.conn.rid}`, msg);
      //net events
      if (isWebSocketCloseEvent(msg)) {
        this.m_clients.delete(ws.conn.rid);
        this.onDisconnected(ws);
        break; //close conn
      }
      //json protocol arraybuffer protocol
      if (typeof msg === "string" || msg instanceof Uint8Array) {
        this.onMessage(ws, msg);
      }
      //
      if (isWebSocketPingEvent(msg)) {
        this.onPing(msg);
      }
      //
      if (isWebSocketPongEvent(msg)) {
        this.onPong(msg);
      }
    }
  }
  /**
   *
   */
  protected onConnected(ws: WebSocket): void {
    this.send({
      id: MsgId.connect,
      from: ws.conn.rid,
      to: 0,
    });
  }
  /**
   *
   */
  protected onMessage(ws: WebSocket, msg: WebSocketMessage): void {
    let cmd = this.unPack(msg);
    let self: any = this;
    let handler = self["on" + MsgId[cmd.id]];
    // console.log('msg',cmd.id,MsgId[cmd.id],cmd.data);
    handler && handler.call(this, ws, cmd);
  }
  /**
   *
   */
  protected onDisconnected(ws: WebSocket): void {
    this.send({
      id: MsgId.disconnect,
      from: ws.conn.rid,
      to: 0,
    });
  }
  /**
   * 
   * @param cmd 
   */
  protected onPing(msg: WebSocketEvent): void {
    console.log('ping', msg);
  }
  /**
 * 
 * @param cmd 
 */
  protected onPong(msg: WebSocketEvent): void {
    console.log('pong', msg);
  }

}
