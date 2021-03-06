/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import { Module, WebSocket, ICmd, IModuleServer } from '../dtf/mod.ts';

//
interface ICommand{
    timestamp:number;
}
//
interface IPos extends ICommand{
    x:number;
    y:number;
    dir:number;
}
//
interface IMoveTo extends ICommand{
    id:number;
    from:IPos;
    to:IPos;

}
//
interface IAttack extends ICommand{
    from:number;
    to:number;
    skill:number;

}
//protocol define
export class FrameSync extends Module {
    //
    protected MsgId: { [index: string]: any } = {
        Pos: 100,
        Attack: 101,
        MoveTo: 102



    };
    //
    public frameRate:number=33;
    //
    protected m_cmdQueue: { [index: string]: ICommand[] }={};
    //
    protected m_cur_ftime:number=Date.now();
    /**
     * 
     * @param ser 
     */
    public init(ser: IModuleServer):void{
        super.init(ser);
        setInterval(()=>{
            

        },this.frameRate);
    }
    /**
     * 
     * @param ws 
     * @param cmd 
     */
    protected onPos( cmd: ICmd): void {
        console.log("pos", cmd.data);
        let pos:IPos = cmd.data;
        pos.timestamp = Date.now();
     
        if(Date.now()-this.m_cur_ftime<=this.frameRate){

        }

        // this.send(cmd.id,cmd.data,cmd.to,ws.conn.rid);
    }
    /**
     * 
     * @param ws 
     * @param cmd 
     */
    protected onAttack(cmd: ICmd): void {


    }
    /**
     * 
     * @param ws 
     * @param cmd 
     */
    protected onMoveTo(cmd: ICmd): void {


    }
}