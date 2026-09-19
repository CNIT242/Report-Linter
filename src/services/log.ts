import fs from 'node:fs/promises'; //file writer
//import { format as formatDate } from 'date-and-time'; //date formater function

import { IncomingMessage } from 'http';

export class Logger 
{
   sessionFile : string;
    //masterFile : string;
   connectionFile : string;
//    cronFile : string;
    private dirname : string; 
    constructor(init:boolean = true)
    {
        this.dirname = import.meta.dirname;
        //const dir = this.dirname + config.get("Log.directory");
        this.sessionFile = this.dirname + process.env.LOG_SESSION;
        //this.masterFile = dir + config.get("Log.master");
        this.connectionFile = this.dirname + process.env.LOG_CONNECTIONS;
         
//        this.cronFile = dir + config.get("Log.cron");

        
        console.log(this.sessionFile);
        
        console.log(this.connectionFile);
        if(init)
            this.init();
    }

    //public Ready: Promise.IThenable<any>;
    private async init() 
    {
        //migrate session.txt to older files.
        //const oldSessionFile = this.dirname + config.get("Log.directory") + "old/" + config.get("Log.session") + ".old-";

        // try 
        // {
            //fs.remove(sessionFile+"."+ config.get("Log.recordCount"), (error : any) => {});
        //     for(let i : number = <number>config.get("Log.recordCount") - 1; i > 0; i--)
        //     {
        //         try {
        //             //await fs.access(oldSessionFile + i, fs.constants.R_OK | fs.constants.W_OK);   //throws on fail
        //             //console.log(oldSessionFile + i);
        //             await fs.rename(oldSessionFile + i, oldSessionFile + (i + 1));
        //         } catch(error) //can't access : may not exist
        //         { 
        //             console.log(error); 
        //             try {
        //                 await fs.appendFile(oldSessionFile + i, "\n\n");
        //             }
        //             catch(e)
        //             {
        //                 console.log(e);
        //             }
        //         } 
        //     }
        //     await fs.rename(this.sessionFile, oldSessionFile + 1);
        // }
        // catch(error)
        // {
        //     console.log(error);
        // }

        // try {
        //     await fs.access(this.sessionFile, fs.constants.R_OK | fs.constants.W_OK);   //throws on fail
        // }
        // catch
        // {
        //     await fs.writeFile(this.sessionFile,"");
        // }
        
        //await fs.appendFile(this.masterFile, "\n\n");
        this.message("Init Logfile");
    };


    private write = async (value : string) => 
    {
        try {
            console.log(value);
            await fs.appendFile(this.sessionFile, value + "\n", null); //pass null as error handleing
            // await fs.appendFile(this.masterFile, value + "\n", null);
            
        } catch (err) {
            console.log(err);
        }
    }

    private format(type : string) : string
    {
        //return type;
        return "["+this.date()+ " | " + type + "]  ";
    }

    public message(value : string) {
        this.write(this.format("LOG  ") + value);
    }

    public warning(value : string) {
        this.write(this.format("WARN ") + value);
    }

    public error(value : string) {
        this.write(this.format("ERROR") + value);
    }

    public connection(type : string, req : IncomingMessage)
    {
        this.writeCon("[" + this.date() + "] [" + req.socket.localPort + "] \t" + req.socket?.remoteAddress + "\t | " + req.method + ":" + req.url);
    }

    
    private async writeCon(value : string)
    {
        try {
            await fs.appendFile(this.connectionFile, value + "\n", null); //pass null as error handleing
            console.log(value);            
        } catch (err) {
            console.log(err);
        }
    }

    // private async writeCron(value : string)
    // {
    //     try {
    //         await fs.appendFile(this.connectionFile, value + "\n", null); //pass null as error handleing
            
    //     } catch (err) {
    //         console.log(err);
    //     } 
    // }


   private date()
   //public date() 
   {
        const now = new Date().toUTCString();
        
        //YYYY-MMM-DD HH:mm:ss
        return `${now.substring(12,16)}-${now.substring(8,11)}-${now.substring(5,7)} ${now.substring(17,25)}`;
    }
}



const log = new Logger();
export default log;
