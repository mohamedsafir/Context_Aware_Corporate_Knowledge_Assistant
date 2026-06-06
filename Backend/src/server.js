import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import queryRoutes from "./routes/query.routes.js";


dotenv.config();
console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.use(errorHandler);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);

// 🚨 2. ADD CORS MIDDLEWARE HERE (This opens the gates!)
app.use(cors({
  origin: "http://localhost:5173", // Only allow your React app to connect
  credentials: true
}));


// TEST ROUTE (to confirm server works)
app.get("/ping", (req, res) => {
  res.json({ message: "Server is alive" });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${process.env.PORT}`);
});
