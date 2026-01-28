const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (collection) => {
    router.post("/", upload.single("file"), (req, res) =>
        uploadController(req, res, collection),
    );

    return router;
};
