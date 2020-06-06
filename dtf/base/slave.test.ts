import { IncomingMessage, Slave } from "./slave.ts";
//the logger interface
interface Logger{
    log(msg:any):Promise<IncomingMessage>;
}

export async function test(){
      // Deno.run({
    //     cmd: ["notepad", "hello"],
    //   })
    let logger = new Slave('./dtf/workers/logger.ts');
    //wrapper a logger with methods as dowWorkAsync
    let logger2 = logger.setup<Logger>(['log',false]);
    //old school way,forget it
    // logger.doWork('log','hello,worker',Handler.create(null,(data:any)=>{
    //     console.log('worker job done',JSON.stringify(data));
    // }));
    //no result need to be waitted
    logger.doWorkAsync('log','test async',true);
    
    let res = await logger2.log('test async2');
    console.log('worker job2 done',JSON.stringify(res));
}