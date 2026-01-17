import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
     performResumeAnalysis,
     getResumeAnalysis,
     performJobAnalysis,
     getJobAnalysis
} from '../controllers/analysis.controller.js';

const router = express.Router();

// Resume analysis routes
router.post('/resume', requireAuth, performResumeAnalysis);
router.get('/resume', requireAuth, getResumeAnalysis);

// Job analysis routes
router.post('/jobs/:targetJobId', requireAuth, performJobAnalysis);
router.get('/jobs/:targetJobId', requireAuth, getJobAnalysis);

export default router;
