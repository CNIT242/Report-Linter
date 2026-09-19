import https from "https";
import fs from "fs";

import log from './log.js';
import api from "./expressServer.js";

console.log("server");

const options = {
  key: fs.readFileSync(process.env.SSL_CRT || "./.crt"),
  cert: fs.readFileSync(process.env.SSL_KEY || "./.key"),
};

const socketServer = https.createServer(options,api);

socketServer.on("error", (req, res) => { 
  log.message("error"); 
});

socketServer.on("secureConnection", (req, res) => {
    log.message("connection"); 
});

socketServer.listen(process.env.PORT, () => {
  log.message("listing on port " + process.env.PORT);
});


//EXPORTS
export default socketServer;