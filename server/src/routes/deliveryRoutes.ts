import { Router } from "express";
import { getDeliveryQuote } from "../controllers/deliveryController.js";

const router = Router();

router.post("/quote", getDeliveryQuote);

export default router;
