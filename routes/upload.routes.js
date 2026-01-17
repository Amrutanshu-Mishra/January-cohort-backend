import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadResume } from '../controllers/upload.controller.js';
import { upload } from '../services/upload.service.js';

const router = express.Router();

// Upload resume route
// POST /api/upload/resume
router.post('/resume', requireAuth, upload.single('resume'), uploadResume);

export default router;
