import express from "express";
import { getMessagesByDealId, sendMessage, sendMessageToAllBuyers } from "../controllers/messageController";
const mrouter = express.Router();

mrouter.post('/message', (req, res) => sendMessage(req, res, req.app.get("io")))
mrouter.get('/message', getMessagesByDealId)
mrouter.post('/messageAll', sendMessageToAllBuyers)

export {mrouter}