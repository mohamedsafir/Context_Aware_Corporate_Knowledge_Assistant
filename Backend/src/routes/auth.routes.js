import express from "express";
import { register, login, getProfile } from "../controllers/auth.controller.js";
// 🚨 THE FIX: Import the bouncer middleware so Node knows what verifyToken is!
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getProfile);

export default router;