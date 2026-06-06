import express from "express";
// 🚨 THE FIX: Ensure all THREE functions are imported here!
import { uploadPDF, getUserDocuments, deleteUserDocument } from "../controllers/upload.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Upload a new document
router.post("/", verifyToken, upload.single("pdf"), uploadPDF);

// View and delete connected database chunks
router.get("/documents", verifyToken, getUserDocuments);
router.delete("/documents/:filename", verifyToken, deleteUserDocument);

export default router;