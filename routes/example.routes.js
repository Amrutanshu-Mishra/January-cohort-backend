import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route
router.get('/public', (req, res) => {
     res.json({ message: "This is a public endpoint." });
});

// Protected route using the custom middleware
router.get('/private', requireAuth, (req, res) => {
     const { userId } = req.auth();
     res.json({
          message: "This is a private endpoint.",
          userId: userId
     });
});

export default router;
