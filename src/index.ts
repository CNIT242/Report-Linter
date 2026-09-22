import https from "./services/httpsServer.js";
import google from "./google.js";
import log from "./services/log.js"
import { exit } from "node:process";

//parse arguments (skipping "/path/to/node" & "/project/path" arguments)
for (let i = 2; i < process.argv.length; ++i) {
    switch(process.argv[i])
    {
        case "--generate":
        case "-g":
            {
                break;
            }
        case "--help":
        case "?":
            {
                console.log(
`
-g --generate
        attempt to generate postgres schema structure
`
                );
                
                process.exit();
            }
    }
}

https.connections;

log.message("testing");
//log.connection("test", );

console.log("tata");

//console.log(https);
//google();
//google();



console.log("post google");