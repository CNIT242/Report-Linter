import Express from "express";
import log from "../services/log.js";

import {oauth2Client} from "../google.js";

const router = Express.Router();

router.get('/auth', async (req, res, next) =>
{
    log.message("auth request recieved");
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/documents'],
    });
    res.header(200).setHeader("Set-Cookie",`Path=/accounts; Expires=${Date.now() + 4}Wed, 13 Jan 2021 22:23:01 GMT; Secure; HttpOnly`).send(`Authorize this app by visiting this <a href="${authUrl}">url</a>.\n\n${authUrl}`);
});

export default router;