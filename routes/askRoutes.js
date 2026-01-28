const express = require("express");
const askController = require("../controllers/askController");

const router = express.Router();

module.exports = (collection) => {
    router.post("/", (req, res) => askController(req, res, collection));
    return router;
};
