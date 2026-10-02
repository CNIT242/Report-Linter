import express from "express";

import log from "../services/log.js";

import callback from "./api/auth-callback.js";
import auth from "./api/auth.js";
import document from "./api/document.js";

const router = express.Router();
router.use("", (req, res, next) =>
{
    log.message("authenicate");
    next();
});

router.use("", callback);
router.use("", auth);
router.use("", document);

export default router;