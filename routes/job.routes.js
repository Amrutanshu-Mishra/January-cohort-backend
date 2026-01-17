import express from 'express';
import { requireCompanyAuth } from '../middleware/company.middleware.js';
import {
     createJob,
     getJobs,
     getJobById,
     updateJob,
     deleteJob,
     getCompanyJobs
} from '../controllers/job.controller.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Company-only routes
router.post('/', requireCompanyAuth, createJob);
router.put('/:id', requireCompanyAuth, updateJob);
router.delete('/:id', requireCompanyAuth, deleteJob);
router.get('/company/my-jobs', requireCompanyAuth, getCompanyJobs);

export default router;
