const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const { getDebts, createDebt, payDebt, deleteDebt } = require("../controllers/debt.controller");

router.use(authMiddleware);

router.get("/", getDebts);
router.post("/", createDebt);
router.patch("/:id/pay", payDebt);
router.delete("/:id", deleteDebt);

module.exports = router;
