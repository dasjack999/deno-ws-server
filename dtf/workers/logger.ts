/********************************************************************************
* the slave worker wrapper
*desc: 
*author:    Jack Liu
*version:   V1.0.0
*********************************************************************************/
import { Processor, IncomingMessage, IOutMessage } from '../base/worker.ts'

class Logger extends Processor {
    /**
     * 
     * @param msg 
     */
    public async log(data: IncomingMessage): Promise<IOutMessage> {
        return new Promise<IOutMessage>((resolve, reject) => {
            console.log('log', JSON.stringify(data.params));

            let res: IOutMessage = {
                id: data.id,
                name: data.name,
                result: true
            };
            resolve(res);
        });
    }
}

console.log('create logger');
Processor.instance = new Logger();