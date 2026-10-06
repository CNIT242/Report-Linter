import express from "express";

import log from "../../services/log.js";
import validate from "../../services/ajv.js";
import {type operation, type patchRequest} from "../../schemas/patchRequest.js";

const router = express.Router();


router.get('/document', async (req, res, next) =>
{
    log.message("auth request recieved");
    res.header(200).send(
        `
       {
  "version": 12,
  "sections": [
    {
      "header": "Introduction",
      "paragraphs": [
        {
          "id": "p-1",
          "text": "First paragraph.",
          "style": "NORMAL_TEXT"
        },
        {
          "id": "p-2",
          "text": "Second paragraph.",
          "style": "NORMAL_TEXT"
        }
      ],
      "problems": [
        {
          "id": "problem-1",
          "paragraphId": "p-2",
          "start": 0,
          "end": 6,
          "severity": "warning",
          "message": "Review this word.",
          "ignored": false
        }
      ]
    },
    {
      "header": "Requirements",
      "paragraphs": [
        {
          "id": "p-3",
          "text": "The system must...",
          "style": "NORMAL_TEXT"
        }
      ],
      "problems": []
    }
  ]
}
        `
    );
});



router.use("/document", express.json());
router.patch('/document', async (req, res, next) =>
{
  log.message("patch request");
  const key = req.get('Idempotency-Key');
  if(key)
  {
    if(validate.patch(req.body))
    {
      const data = <patchRequest>req.body;
      console.log("valid");
      console.log(data);
    }
    else
    {
      console.log("invalid");
    }
    console.log(req.body);

    console.log(req.body.operations[0].operation);
//    console.log(req.body);
  }
  else
    res.status(400).send("No Idempotency-Key");
    
  /*
  const response = await fetch("/api/document", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Idempotency-Key": batch.batchId
            },
            body: JSON.stringify({
                baseVersion: state.document.version,
                operations: batch.operations.map(item => item.operation)
            })
        });
        */
});

export default router;