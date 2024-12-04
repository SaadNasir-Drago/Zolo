import express from "express";
import authMiddleware from "../middleware/authmiddleware";
import {acceptDeal, createDeal, getAllDealsWithDetails, getDealProperty, getUserDeals, rejectDeal} from "../controllers/dealController";

const drouter = express.Router();

drouter.get('/dealProperty', getDealProperty)
drouter.post('/deal', createDeal)
drouter.get('/deals', authMiddleware, getAllDealsWithDetails)
drouter.put('/declineDeal', rejectDeal)
drouter.put('/acceptDeal', (req, res) => acceptDeal(req, res, req.app.get("io")))

export {drouter}