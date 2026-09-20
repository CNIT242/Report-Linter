import https from "./services/httpsServer.js";
import google from "./google.js";
import log from "./services/log.js"

for (let i = 2; i < process.argv.length; ++i) {
    console.log(
        `index ${i} 
        argument -> 
        ${process.argv[i]}
        `
    );
}

https.connections;

log.message("testing");
//log.connection("test", );

console.log("tata");

//console.log(https);
//google();
//google();



console.log("post google");