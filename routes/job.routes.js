import express from 'express';
import { requireCompanyAuth } from '../middleware/company.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
     createJob,
     getJobs,
     getJobById,
     updateJob,
     deleteJob,
     getCompanyJobs,
     applyToJob,
     evaluateSkillGap,
     getJobApplicants,
     getAllCompanyApplicants,
     updateApplicantStatus,
     getCompanyStats
} from '../controllers/job.controller.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// User routes (authenticated users)
router.post('/:id/evaluate-gap', requireAuth, evaluateSkillGap);
router.post('/:id/apply', requireAuth, applyToJob);

// Company-only routes
router.post('/', requireCompanyAuth, createJob);
router.put('/:id', requireCompanyAuth, updateJob);
router.delete('/:id', requireCompanyAuth, deleteJob);
router.get('/company/my-jobs', requireCompanyAuth, getCompanyJobs);
router.get('/company/stats', requireCompanyAuth, getCompanyStats);
router.get('/company/applicants', requireCompanyAuth, getAllCompanyApplicants);
router.get('/:id/applicants', requireCompanyAuth, getJobApplicants);
router.put('/:jobId/applicants/:applicationId/status', requireCompanyAuth, updateApplicantStatus);

export default router;
