import { Router } from "express";
import { generateApiKey } from "../controllers/adminController.js";
import { adminGuard } from "../middlewares/adminGuard.js";

const router = Router();
router.use(adminGuard);
router.post("/keys", generateApiKey);

export default router;
