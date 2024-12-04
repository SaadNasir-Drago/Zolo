
import {login, register } from "../controllers/authController";
import express from "express";
const router = express.Router();

// Registration route
router.post('/register', register);
router.post('/login',login)


export {router}
