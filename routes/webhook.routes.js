import express from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Clerk webhook endpoint - no auth required, verified by svix signature
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
