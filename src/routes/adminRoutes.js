import { Router } from "express";
import { generateApiKey } from "../controllers/adminController.js";
import { adminGuard } from "../middlewares/adminGuard.js";

const router = Router();
router.use(adminGuard);
router.post("/api-keys", generateApiKey);

export default router;
