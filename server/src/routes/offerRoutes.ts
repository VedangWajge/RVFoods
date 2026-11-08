import { Router } from "express";
import { getPublicOffer } from "../controllers/offerController.js";

const router = Router();

router.get("/", getPublicOffer);

export default router;
