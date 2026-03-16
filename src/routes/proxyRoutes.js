import { Router } from "express";
import { handleProxyRequest } from '../controllers/proxyController.js';
import { authGuard } from '../middlewares/authGuard.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// 1. Apply Rate Limiting first (block spammers before hitting the DB)
// 2. Apply Auth Guard (verify the API key)
// 3. Match ALL routes and methods, then forward them
router.all(/(.*)/, rateLimiter, authGuard, handleProxyRequest);
export default router;
