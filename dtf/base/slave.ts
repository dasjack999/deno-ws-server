/********************************************************************************
 * the slave worker wrapper
 *desc: 
 *author:    Jack Liu
 *version:   V1.0.0
*********************************************************************************/
//
import { Handler } from "./handler.ts";

export interface ResolvableMethods<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => void;
}

export type Resolvable<T> = Promise<T> & ResolvableMethods<T>;

export function createResolvable<T>(): Resolvable<T> {
    let methods: ResolvableMethods<T>;
    const promise = new Promise<T>((resolve, reject): void => {
        methods = { resolve, reject };
    });
    // TypeScript doesn't know that the Promise callback occurs synchronously
    // therefore use of not null assertion (`!`)
    return Object.assign(promise, methods!) as Resolvable<T>;
}


export interface IncomingMessage {
    id: number;
    name: string;
    result: any;
    done?: boolean;
    error?: any;
    notify?: any;
}
export interface IOutMessage {
    name: string,
    params: any,
    id?: number
}
//////////////////////////////////////////////////////////////////////////////////////
//
//author:jack liu
/////////////////////////////////////////////////////////////////////////////////////
export class Slave extends EventTarget {
    //
    public static evt_done: string = '1';
    //
    public static evt_error: string = '2';
    //
    public static evt_notify: string = '3';
    //
    public static loadLib: Function;
    //
    protected m_worker !: Worker | null;
    //
    protected m_handlers: Map<number,Handler>=new Map<number,Handler>(); //{ [key: string]: Handler } = {};
    //
    protected m_idPool:number[]=[];
    //
    protected m_flowId: number = 1;
    //
    protected m_promises: Map<number,Resolvable<IncomingMessage> > = new Map<number,Resolvable<IncomingMessage> >(); //{ [key: string]: Resolvable<IncomingMessage> } = {};
    /**
     * 
     */
    protected getId():number{
        if(this.m_idPool.length){
            return this.m_idPool.shift() as number;
        }
        return this.m_flowId++;
    }
    /**
    * 
    */
    public static isSupport(): boolean {
        return typeof Worker != 'undefined';
    }
    /**
    *
    */
    public constructor(path: string) {
        super();
        if (Slave.isSupport()) {
            this.m_worker = new Worker(path, { type: "module", deno: true });
            this.m_worker.onmessage = this.onMessage.bind(this);
            this.m_worker.onerror = this.onError.bind(this);
        }
    }
    /**
     * 
     * @param cmd 
     */
    public setup<T>(cmds:any[]):T{
        if(cmds.length%2 != 0){
            console.error('params should like [cmd,false,cmd2,true...]');
            return {} as T;
        }
        let alex:any={};
        for(let i=0;i<cmds.length;i+=2){
            let fname=cmds[i] as string;
            let noResult = cmds[i+1] as boolean;
            alex[fname]= async(params?:any):Promise<IncomingMessage>=>{
                return this.doWork(fname,params,noResult);
            };
        }
        Object.assign(this,alex);
        let This = this as any;
        return This as T;
    }
    /**
    * 
    */
    public close(): void {
        if (this.m_worker) {
            this.m_worker.terminate();
            this.m_worker = null;
        }
    }
    /**
    * 
    */
    public doWorkSync(name: string, params?: any, handler?: Handler): void {
        if (!this.m_worker) {
            this.onError('worker closed.');
            return;
        }
        let msg:IOutMessage = {
            name: name,
            params: params
        };
        if (handler) {
            let curId = this.getId();
            msg.id = curId;
            this.m_handlers.set(curId, handler);
        }
        this.m_worker.postMessage(msg);
    }
    /**
     * 
     * @param name 
     * @param params 
     */
    public async doWork(name:string,params?:any,noResult?:boolean):Promise<IncomingMessage>{
        
        let promise = createResolvable<IncomingMessage>();
        if (!this.m_worker) {
            promise.reject();
            return promise;
        }
        let msg:IOutMessage = {
            name: name,
            params: params
        };
        if(noResult){
            this.m_worker.postMessage(msg);
            promise.resolve();
            return promise;
        }

        let curId = this.getId();
        msg.id=curId;
        this.m_promises.set(curId,promise);
        this.m_worker.postMessage(msg);
        return promise;
    }
    /**
    * 
    */
    public postMessage(msg: any, transferList: any[]): void {
        if (this.m_worker) {
            return this.m_worker.postMessage(msg, transferList);
        }
    }
    /**
    * 
    */
    protected onMessage(evt: MessageEvent): void {

        let msg = evt.data;
        if (msg.done) {
            this.onDone();
        } else if (msg.error) {
            this.onError(msg.error);
        } else if (msg.notify) {
            this.onNotify(msg);
        } else {
            // console.log('got in slave',JSON.stringify(msg));
            let handler = this.m_handlers.get(msg.id);
            if (handler) {
                handler.runWith(msg.result);
                this.m_handlers.delete(msg.id);
            }
            let promise =this.m_promises.get(msg.id);
            if(promise){
                // console.log('got promise',promise,msg.id);
                promise.resolve(msg);
                this.m_promises.delete(msg.id);
            }
            this.m_idPool.push(msg.id);
        }
    }
    /**
    * 
    */
    protected onDone(): void {
        if (this.m_worker) {
            this.m_worker.terminate();
            this.m_worker = null;
        }
        this.dispatchEvent(new CustomEvent(Slave.evt_done));
    }
    /**
    * 
    */
    protected onError(err: any): void {
        if (this.m_worker) {
            this.m_worker.terminate();
            this.m_worker = null;
        }
        this.dispatchEvent(new CustomEvent(Slave.evt_error, {
            detail: err
        }));
    }
    /**
    * 
    */
    protected onNotify(data: any): void {
        this.dispatchEvent(new CustomEvent(Slave.evt_notify, {
            detail: data
        }));
    }






}



