import https from "https";
import fs from "fs";

import log from './log.js';
import api from "./expressServer.js";

console.log("server");

const options = {
  cert: fs.readFileSync(process.env.SSL_CRT || "./.crt"),
  key: fs.readFileSync(process.env.SSL_KEY || "./.key"),
};
const server = https.createServer(options,api);

server.on("error", (req, res) => { 
  log.message("error"); 
});

server.on("secureConnection", (req, res) => {
    log.message("connection"); 
});

server.listen(process.env.PORT, () => {
  log.message("listing on port " + process.env.PORT);
});


//EXPORTS
export default server;