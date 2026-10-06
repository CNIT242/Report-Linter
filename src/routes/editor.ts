import Express from "express";
import log from "../services/log.js";

const router = Express.Router();

log.message("static loading");

router.use("", (req,res, next) =>
{
    log.message(req.path);
    next();
})
router.use("", Express.static('html'));
router.use("/js", Express.static('dist/client'));

export default router;