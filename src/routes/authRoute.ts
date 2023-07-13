import express from "express";
import { authorization, decision, token } from "../controllers/authController";

const router = express.Router();

router.get("/authorize", authorization);

router.post("/decision", decision);

router.post("/token", token);

export default router;
