import Express from "express";
import log from "../services/log.js";

const router = Express.Router();

router.post('/callback', async (req, res, next) =>
{
    log.message("auth request recieved");
});

export default router;