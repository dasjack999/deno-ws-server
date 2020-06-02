/********************************************************************************
 *the base ws server
 * 
 *author:    Jack Liu
 *dasjack@outlook.com
 *version:   V1.0.0
*********************************************************************************/
export class Handler {
    //
    protected once:boolean=false;
    //
    protected _id:number=0;
    //
    protected method:any;
    //
    protected caller:any;
    //
    protected args:any;
    //
    protected static _pool:Handler[]=[];
    //
    protected static _gid:number=1;
    /**
     * 
     * @param caller 
     * @param method 
     * @param args 
     * @param once 
     */
    constructor(caller:any = null, method:any = null, args:any = null, once = false) {
        this.once = false;
        this._id = 0;
        this.setTo(caller, method, args, once);
    }
    /**
     * 
     * @param caller 
     * @param method 
     * @param args 
     * @param once 
     */
    setTo(caller:any, method:any, args:any[], once:boolean = false):Handler {
        this._id = Handler._gid++;
        this.caller = caller;
        this.method = method;
        this.args = args;
        this.once = once;
        return this;
    }
    /**
     * 
     */
    run():any {
        if (this.method == null)
            return null;
        let id = this._id;
        let result = this.method.apply(this.caller, this.args);
        this._id === id && this.once && this.recover();
        return result;
    }
    /**
     * 
     * @param data 
     */
    runWith(data:any):any {
        if (this.method == null)
            return null;
        let id = this._id;
        let result;
        if (data == null)
            result = this.method.apply(this.caller, this.args);
        else if (!this.args && !data.unshift)
            result = this.method.call(this.caller, data);
        else if (this.args)
            result = this.method.apply(this.caller, this.args.concat(data));
        else
            result = this.method.apply(this.caller, data);
        this._id === id && this.once && this.recover();
        return result;
    }
    /**
     * 
     */
    clear():Handler {
        this.caller = null;
        this.method = null;
        this.args = null;
        return this;
    }
    /**
     * 
     */
    recover() :void{
        if (this._id > 0) {
            this._id = 0;
            Handler._pool.push(this.clear());
        }
    }
    /**
     * 
     * @param caller 
     * @param method 
     * @param args 
     * @param once 
     */
    static create(caller:any, method:any, args:any = null, once:boolean = true):Handler {
        if (Handler._pool.length){
            let h = Handler._pool.pop();
            if(h){
                h.setTo(caller, method, args, once);
            }
            return h as Handler;
        }
        return new Handler(caller, method, args, once);
    }
}
