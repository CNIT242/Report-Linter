import fs from 'node:fs/promises'; //file writer
//import { format as formatDate } from 'date-and-time'; //date formater function

import { IncomingMessage } from 'http';

export class Logger 
{
   sessionFile : string;
   connectionFile : string;
    private dirname : string; 
    constructor(init:boolean = true)
    {
        this.dirname = import.meta.dirname;
        this.sessionFile = this.dirname + process.env.LOG_SESSION;
        this.connectionFile = this.dirname + process.env.LOG_CONNECTIONS;
        
        if(init)
            this.init();
    }

    private async init() 
    {
        //await fs.appendFile(this.masterFile, "\n\n");
        this.message("Init Logfile");
    };


    private write = async (value : string) => 
    {
        try {
            console.log(value);
            await fs.appendFile(this.sessionFile, value + "\n", null); //pass null as error handleing            
        } catch (err) {
            console.log(err);
        }
    }

    private format(type : string) : string
    {
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


   private date()
   {
        const now = new Date().toUTCString();
        
        //YYYY-MMM-DD HH:mm:ss
        return `${now.substring(12,16)}-${now.substring(8,11)}-${now.substring(5,7)} ${now.substring(17,25)}`;
    }
}



const log = new Logger();
export default log;
