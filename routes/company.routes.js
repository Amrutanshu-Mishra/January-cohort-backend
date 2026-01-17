import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
     registerCompany,
     getCompanyProfile,
     updateCompanyProfile
} from '../controllers/company.controller.js';

const router = express.Router();

// Register company
router.post('/register', requireAuth, registerCompany);

// Get company profile
router.get('/profile', requireAuth, getCompanyProfile);

// Update company profile
router.put('/profile', requireAuth, updateCompanyProfile);

export default router;
