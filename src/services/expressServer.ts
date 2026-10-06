
import express from 'express';
import log from './log.js';

import api from '../routes/api.js';
import editor from '../routes/editor.js';
//todo: http/2?
//spdy?

const server = express();
server.disable('x-powered-by');
server.disable('etag');

//catch all requests and log them.
server.use((req, res, next) =>
{
  log.message("https request");
  next();
});

//api routes
server.use("/api/", api);
server.use("/editor/", editor);

//catch all. 
server.use((req, res, next) =>
{
  res.status(404).send();
});


export default server;
