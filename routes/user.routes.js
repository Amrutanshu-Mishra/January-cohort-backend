import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
     syncUser,
     updateProfile,
     getProfile,
     addTargetJob,
     updateJobAnalysis
} from '../controllers/user.controller.js';

const router = express.Router();

// Sync user from Clerk
router.post('/sync', requireAuth, syncUser);

// Get user profile
router.get('/profile', requireAuth, getProfile);

// Update user profile
router.put('/profile', requireAuth, updateProfile);

// Add target job
router.post('/target-jobs', requireAuth, addTargetJob);

// Update job analysis
router.put('/target-jobs/:jobId/analysis', requireAuth, updateJobAnalysis);

export default router;
