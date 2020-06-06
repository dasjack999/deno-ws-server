/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
import { IModuleServer, IModule } from './interfaces.ts';
import { Handler } from './handler.ts';


export class Module implements IModule{
    //
    protected MsgId: { [index: string]: number } ={};
    //
    protected m_server!: IModuleServer;
    /**
     * 
     * @param ser 
     */
    public init(ser: IModuleServer): void {
        this.m_server = ser;
        this.regServices(this.MsgId);
    }
    /**
     * 
     * @param msgIds 
     */
    protected regServices(msgIds:any):void{
        this.m_server.addMsgIds(msgIds);
        let self:any=this;
        for(let k in msgIds){
            this.m_server.regHandler(msgIds[k],Handler.create(this,(...args:any[])=>{
                let m = self['on'+k];
                m&&m.apply(this,args);
            }));
        }
    }
    /**
     * 
     * @param id 
     * @param data 
     * @param to 
     * @param from 
     */
    public send(id: number, data: any=null, to: number | number[] = 0, from: number = 0): void {
        if (!this.m_server) {
            return;
        }
        this.m_server.send({
            id: id,
            from: from,
            data: data,
            to: to
        });
    }
}