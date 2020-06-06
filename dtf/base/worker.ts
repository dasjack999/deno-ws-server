/********************************************************************************
* the slave worker wrapper
*desc: 
*author:    Jack Liu
*version:   V1.0.0
*********************************************************************************/


export interface IncomingMessage {


    name: string,
    params: any,
    id: number
}
export interface IOutMessage {
    id: number;
    name: string;
    result?: any;
    done?: boolean;
    error?: any;
    notify?: any;
}

export class Processor {
    //
    public static instance: Processor;
    // /**
    //  * 
    //  * @param msg 
    //  */
    // public async log(data: IncomingMessage): Promise<IOutMessage> {
    //     return new Promise<IOutMessage>((resolve, reject) => {
    //         console.log('log', JSON.stringify(data.params));

    //         let res: IOutMessage = {
    //             id: data.id,
    //             name: data.name
    //         };
    //         resolve(res);
    //     });
    // }
    /**
     * 
     * @param e 
     */
    public static async onMessage(e: MessageEvent) {
        if (!Processor.instance) {
            return;
        }
        const { name } = e.data;

        const processor = Processor.instance as any;
        // console.log('work come', name, processor.constructor.name, processor[name]);
        if (processor[name]) {
            let outMsg: IOutMessage = await processor[name](e.data);
            if(outMsg.id){
                self.postMessage(outMsg);
            }
            // console.log('worker msg', name, outMsg.result);
            
        }


    }
}

self.onmessage = Processor.onMessage;