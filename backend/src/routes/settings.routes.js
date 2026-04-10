const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const { getSettings, updateSettings } = require("../controllers/settings.controller");

router.get("/", authMiddleware, getSettings);
router.patch("/", authMiddleware, updateSettings);

module.exports = router;