import express from "express";
// 🚨 THE FIX: Add deleteChat to this import list!
import { askQuestion, getChatHistory, deleteChat } from "../controllers/query.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/ask", verifyToken, askQuestion);
router.get("/history", verifyToken, getChatHistory);
// Now Node knows exactly where to find deleteChat!
router.delete("/history/:id", verifyToken, deleteChat);

export default router;