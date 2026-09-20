import Express from "express";
import log from "../services/log.js";

const router = Express.Router();

router.get('/callback', async (req, res, next) =>
{
    
    const reqUrl = new URL(req.url, `https://${process.env.HOST}`);
    const code = reqUrl.searchParams.get('code');
    console.log(req);
          
    if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication successful! You can close this window.</h1>');
        log.message(code);
    }
    log.message("auth request recieved");
});

export default router;