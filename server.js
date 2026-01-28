require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const askRoutes = require("./routes/askRoutes");

const openai = require("./services/openai");

const app = express();
app.use(express.json());

async function start() {
    const collection = await connectDB();

    app.use("/upload", uploadRoutes(collection));
    app.use("/ask", askRoutes(collection));

    app.listen(5000, () => {
        console.log("Server running on http://localhost:5000");
    });
}

start();
