
import express from 'express';
import log from './log.js';

import callback from "../routes/auth-callback.js";
import auth from "../routes/auth.js";


//todo: http/2?
//spdy?

const api = express();
api.disable('x-powered-by');
api.disable('etag');

//catch all requests and log them.
api.use((req, res, next) =>
{
  log.message("https request");
  next();
});

//api routes
api.use("", callback);
api.use("", auth);


//catch all. 
api.use((req, res, next) =>
{
  res.status(404).send();
});


export default api;
