import express from "express";
import log from "../../services/log.js";

const router = express.Router();

router.get('/document', async (req, res, next) =>
{
    log.message("auth request recieved");
    res.header(200).send(
        `
        {
  "problems": [
    {
      "id": "problem-123",
      "paragraphId": "paragraph-4",
      "start": 17,
      "end": 25,
      "severity": "error",
      "message": "This term is not allowed.",
      "ignored": false
    }
  ]
}
        `
    );
});

export default router;