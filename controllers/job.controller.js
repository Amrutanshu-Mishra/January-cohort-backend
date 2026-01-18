import Job from '../models/Job.js';

// Create a new job
export const createJob = async (req, res) => {
     try {
          const company = req.company; // From company auth middleware

          const {
               title,
               description,
               requirements,
               location,
               type,
               experienceLevel,
               salary,
               status
          } = req.body;

          if (!title || !description) {
               return res.status(400).json({ message: "Title and description are required" });
          }

          const job = await Job.create({
               companyId: company._id,
               companyName: company.companyName,
               postedBy: company._id,
               title,
               description,
               requirements: requirements || [],
               location,
               type: type || 'Full-time',
               experienceLevel,
               salary,
               status: status || 'Active'
          });

          res.status(201).json({
               message: "Job created successfully",
               job
          });
     } catch (error) {
          console.error("Error creating job:", error);
          res.status(500).json({ message: "Error creating job", error: error.message });
     }
};


// Generate job description using AI (company auth required)
export const generateDescription = async (req, res) => {
     try {
          const { prompt } = req.body;

          if (!prompt) {
               return res.status(400).json({ message: "Prompt is required" });
          }

          // Dynamic import to avoid circular dependency issues if any
          const { generateJobDescription } = await import('../services/gemini.service.js');

          const result = await generateJobDescription(prompt);

          if (!result.success) {
               return res.status(500).json({ message: "Failed to generate description", error: result.error });
          }

          res.status(200).json({ data: result.data });
     } catch (error) {
          console.error("Error generating description:", error);
          res.status(500).json({ message: "Error generating description", error: error.message });
     }
};


// Get all jobs (public)
export const getJobs = async (req, res) => {
     try {
          const { status, type, experienceLevel, companyId } = req.query;

          const filter = {};
          if (status) filter.status = status;
          if (type) filter.type = type;
          if (experienceLevel) filter.experienceLevel = experienceLevel;
          if (companyId) filter.companyId = companyId;

          const jobs = await Job.find(filter)
               .populate('companyId', 'companyName logo website')
               .sort({ createdAt: -1 });

          res.status(200).json({ jobs, count: jobs.length });
     } catch (error) {
          console.error("Error fetching jobs:", error);
          res.status(500).json({ message: "Error fetching jobs", error: error.message });
     }
};

// Get single job by ID (public)
export const getJobById = async (req, res) => {
     try {
          const { id } = req.params;

          const job = await Job.findById(id)
               .populate('companyId', 'companyName logo website description industry');

          if (!job) {
               return res.status(404).json({ message: "Job not found" });
          }

          res.status(200).json({ job });
     } catch (error) {
          console.error("Error fetching job:", error);
          res.status(500).json({ message: "Error fetching job", error: error.message });
     }
};

// Update job (company auth required)
export const updateJob = async (req, res) => {
     try {
          const company = req.company;
          const { id } = req.params;

          const {
               title,
               description,
               requirements,
               location,
               type,
               experienceLevel,
               salary,
               status
          } = req.body;

          // Verify job belongs to this company
          const job = await Job.findOne({ _id: id, companyId: company._id });

          if (!job) {
               return res.status(404).json({ message: "Job not found or access denied" });
          }

          const updatedJob = await Job.findByIdAndUpdate(
               id,
               {
                    $set: {
                         title,
                         description,
                         requirements,
                         location,
                         type,
                         experienceLevel,
                         salary,
                         status
                    }
               },
               { new: true, runValidators: true }
          );

          res.status(200).json({
               message: "Job updated successfully",
               job: updatedJob
          });
     } catch (error) {
          console.error("Error updating job:", error);
          res.status(500).json({ message: "Error updating job", error: error.message });
     }
};

// Delete job (company auth required)
export const deleteJob = async (req, res) => {
     try {
          const company = req.company;
          const { id } = req.params;

          // Verify job belongs to this company
          const job = await Job.findOne({ _id: id, companyId: company._id });

          if (!job) {
               return res.status(404).json({ message: "Job not found or access denied" });
          }

          await Job.findByIdAndDelete(id);

          res.status(200).json({ message: "Job deleted successfully" });
     } catch (error) {
          console.error("Error deleting job:", error);
          res.status(500).json({ message: "Error deleting job", error: error.message });
     }
};

// Get company's jobs (company auth required)
export const getCompanyJobs = async (req, res) => {
     try {
          const company = req.company;

          const jobs = await Job.find({ companyId: company._id })
               .sort({ createdAt: -1 });

          res.status(200).json({ jobs, count: jobs.length });
     } catch (error) {
          console.error("Error fetching company jobs:", error);
          res.status(500).json({ message: "Error fetching company jobs", error: error.message });
     }
};

// Evaluate skill gap for a job before applying (user auth required)
export const evaluateSkillGap = async (req, res) => {
     try {
          const { userId } = req.auth();
          const { id } = req.params;

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          // Import services
          const User = (await import('../models/User.js')).default;
          const { analyzeSkillGap } = await import('../services/gemini.service.js');

          // Find the user
          const user = await User.findOne({ clerkId: userId });
          if (!user) {
               return res.status(404).json({ message: "User not found. Please complete your profile first." });
          }

          // Check if user has a resume
          if (!user.resume) {
               return res.status(400).json({
                    message: "Please upload your resume first before applying.",
                    requiresResume: true
               });
          }

          // Find the job
          const job = await Job.findById(id);
          if (!job) {
               return res.status(404).json({ message: "Job not found" });
          }

          // Check if already applied
          const alreadyApplied = job.applicants?.some(
               app => app.userId?.toString() === user._id.toString()
          );

          if (alreadyApplied) {
               return res.status(400).json({ message: "You have already applied to this job" });
          }

          // Perform skill gap analysis
          // Pass resumeAnalysis if available, or null if not analyzed yet
          const result = await analyzeSkillGap(user, job, user.resumeAnalysis || null);

          if (!result.success) {
               console.error("Skill gap analysis failed:", result.error);
               return res.status(500).json({
                    message: "Unable to analyze skill gap. Please try again later.",
                    error: result.error
               });
          }

          const { matchPercentage, matchSummary, criticalGaps, recommendedActions, timelineAssessment, strengths, proficiencyGaps } = result.analysis;

          // Define threshold for significant skill gap (60% or less)
          const SKILL_GAP_THRESHOLD = 60;
          const hasSignificantGap = matchPercentage < SKILL_GAP_THRESHOLD;

          // Store analysis in user's target jobs
          let targetJob = user.targetJobs?.find(tj => tj.jobId === id);
          if (!targetJob) {
               user.targetJobs.push({
                    jobId: id,
                    title: job.title,
                    description: job.description,
                    company: job.companyName,
                    analysisStatus: 'Completed',
                    matchPercentage,
                    matchSummary,
                    strengths,
                    criticalGaps,
                    proficiencyGaps,
                    recommendedActions,
                    timelineAssessment,
                    analyzedAt: new Date()
               });
          } else {
               targetJob.analysisStatus = 'Completed';
               targetJob.matchPercentage = matchPercentage;
               targetJob.matchSummary = matchSummary;
               targetJob.strengths = strengths;
               targetJob.criticalGaps = criticalGaps;
               targetJob.proficiencyGaps = proficiencyGaps;
               targetJob.recommendedActions = recommendedActions;
               targetJob.timelineAssessment = timelineAssessment;
               targetJob.analyzedAt = new Date();
          }
          await user.save();

          // Reload user to get the updated target job with _id
          const updatedUser = await User.findOne({ clerkId: userId });
          const savedTargetJob = updatedUser.targetJobs?.find(tj => tj.jobId === id);

          res.status(200).json({
               hasSignificantGap,
               matchPercentage,
               matchSummary,
               strengths,
               criticalGaps,
               proficiencyGaps,
               recommendedActions,
               timelineAssessment,
               jobId: id,
               jobTitle: job.title,
               companyName: job.companyName,
               targetJobId: savedTargetJob?._id
          });
     } catch (error) {
          console.error("Error evaluating skill gap:", error);
          res.status(500).json({ message: "Error evaluating skill gap", error: error.message });
     }
};

// Apply to a job (user auth required)
export const applyToJob = async (req, res) => {
     try {
          const { userId } = req.auth();
          const { id } = req.params;
          const { skipGapCheck } = req.body; // Allow skipping gap check if already reviewed roadmap

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          // Import User model dynamically to avoid circular dependency
          const User = (await import('../models/User.js')).default;

          // Find the user
          const user = await User.findOne({ clerkId: userId });
          if (!user) {
               return res.status(404).json({ message: "User not found. Please complete your profile first." });
          }

          // Find the job
          const job = await Job.findById(id);
          if (!job) {
               return res.status(404).json({ message: "Job not found" });
          }

          // Check if already applied
          const alreadyApplied = job.applicants?.some(
               app => app.userId?.toString() === user._id.toString()
          );

          if (alreadyApplied) {
               return res.status(400).json({ message: "You have already applied to this job" });
          }

          // Add user to job applicants
          if (!job.applicants) {
               job.applicants = [];
          }
          job.applicants.push({
               userId: user._id,
               appliedAt: new Date(),
               status: 'Applied'
          });
          await job.save();

          // Also add this job to user's target jobs if not exists
          const existingTargetJob = user.targetJobs?.find(
               tj => tj.jobId === id
          );

          if (!existingTargetJob) {
               user.targetJobs.push({
                    jobId: id,
                    title: job.title,
                    description: job.description,
                    company: job.companyName,
                    analysisStatus: 'Pending',
                    skillGaps: []
               });
               await user.save();
          }

          res.status(200).json({
               message: "Application submitted successfully",
               jobId: id,
               jobTitle: job.title
          });
     } catch (error) {
          console.error("Error applying to job:", error);
          res.status(500).json({ message: "Error applying to job", error: error.message });
     }
};

// Get all applicants for a specific job (company auth required)
export const getJobApplicants = async (req, res) => {
     try {
          const company = req.company;
          const { id } = req.params;

          // Find the job and verify it belongs to this company
          const job = await Job.findOne({ _id: id, companyId: company._id });

          if (!job) {
               return res.status(404).json({ message: "Job not found or access denied" });
          }

          // Import User model
          const User = (await import('../models/User.js')).default;

          // Get user details for all applicants
          const applicantIds = job.applicants?.map(app => app.userId) || [];
          const users = await User.find({ _id: { $in: applicantIds } })
               .select('fullName email skills experienceLevel resume resumeAnalysis linkedinProfile githubProfile portfolio');

          // Combine applicant data with user profiles
          const applicantsWithDetails = job.applicants?.map(app => {
               const userProfile = users.find(u => u._id.toString() === app.userId?.toString());
               return {
                    applicationId: app._id,
                    userId: app.userId,
                    appliedAt: app.appliedAt,
                    status: app.status,
                    user: userProfile ? {
                         fullName: userProfile.fullName,
                         email: userProfile.email,
                         skills: userProfile.skills,
                         experienceLevel: userProfile.experienceLevel,
                         resume: userProfile.resume,
                         linkedinProfile: userProfile.linkedinProfile,
                         githubProfile: userProfile.githubProfile,
                         portfolio: userProfile.portfolio,
                         resumeAnalysis: userProfile.resumeAnalysis?.overallAssessment
                    } : null
               };
          }) || [];

          res.status(200).json({
               job: {
                    id: job._id,
                    title: job.title,
                    location: job.location,
                    type: job.type
               },
               applicants: applicantsWithDetails,
               count: applicantsWithDetails.length
          });
     } catch (error) {
          console.error("Error fetching job applicants:", error);
          res.status(500).json({ message: "Error fetching applicants", error: error.message });
     }
};

// Get all applicants for all company jobs (company auth required)
export const getAllCompanyApplicants = async (req, res) => {
     try {
          const company = req.company;

          // Find all jobs for this company
          const jobs = await Job.find({ companyId: company._id });

          // Import User model
          const User = (await import('../models/User.js')).default;

          // Collect all applicant IDs
          const allApplicantIds = [];
          jobs.forEach(job => {
               job.applicants?.forEach(app => {
                    if (app.userId && !allApplicantIds.includes(app.userId.toString())) {
                         allApplicantIds.push(app.userId.toString());
                    }
               });
          });

          // Get all user profiles
          const users = await User.find({ _id: { $in: allApplicantIds } })
               .select('fullName email skills experienceLevel resume resumeAnalysis linkedinProfile githubProfile portfolio');

          // Build applicants list with job info
          const applicantsWithJobs = [];
          jobs.forEach(job => {
               job.applicants?.forEach(app => {
                    const userProfile = users.find(u => u._id.toString() === app.userId?.toString());
                    if (userProfile) {
                         applicantsWithJobs.push({
                              applicationId: app._id,
                              userId: app.userId,
                              appliedAt: app.appliedAt,
                              status: app.status,
                              job: {
                                   id: job._id,
                                   title: job.title,
                                   location: job.location,
                                   type: job.type
                              },
                              user: {
                                   id: userProfile._id,
                                   fullName: userProfile.fullName,
                                   email: userProfile.email,
                                   skills: userProfile.skills,
                                   experienceLevel: userProfile.experienceLevel,
                                   resume: userProfile.resume,
                                   linkedinProfile: userProfile.linkedinProfile,
                                   githubProfile: userProfile.githubProfile,
                                   portfolio: userProfile.portfolio,
                                   careerLevel: userProfile.resumeAnalysis?.overallAssessment?.careerLevel,
                                   strengths: userProfile.resumeAnalysis?.overallAssessment?.strengths
                              }
                         });
                    }
               });
          });

          // Sort by applied date (most recent first)
          applicantsWithJobs.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

          res.status(200).json({
               applicants: applicantsWithJobs,
               count: applicantsWithJobs.length,
               uniqueCandidates: allApplicantIds.length
          });
     } catch (error) {
          console.error("Error fetching company applicants:", error);
          res.status(500).json({ message: "Error fetching applicants", error: error.message });
     }
};

// Update applicant status (company auth required)
export const updateApplicantStatus = async (req, res) => {
     try {
          const company = req.company;
          const { jobId, applicationId } = req.params;
          const { status } = req.body;

          const validStatuses = ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];
          if (!validStatuses.includes(status)) {
               return res.status(400).json({
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
               });
          }

          // Find the job and verify ownership
          const job = await Job.findOne({ _id: jobId, companyId: company._id });

          if (!job) {
               return res.status(404).json({ message: "Job not found or access denied" });
          }

          // Find the applicant
          const applicant = job.applicants?.id(applicationId);

          if (!applicant) {
               return res.status(404).json({ message: "Applicant not found" });
          }

          // Update status
          applicant.status = status;
          await job.save();

          res.status(200).json({
               message: "Applicant status updated successfully",
               applicationId,
               newStatus: status
          });
     } catch (error) {
          console.error("Error updating applicant status:", error);
          res.status(500).json({ message: "Error updating status", error: error.message });
     }
};

// Get company dashboard stats
export const getCompanyStats = async (req, res) => {
     try {
          const company = req.company;

          // Get all jobs for this company
          const jobs = await Job.find({ companyId: company._id });

          // Calculate stats
          const totalJobs = jobs.length;
          const activeJobs = jobs.filter(j => j.status === 'Active').length;
          const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

          let totalApplicants = 0;
          let statusCounts = {
               Applied: 0,
               Reviewed: 0,
               Shortlisted: 0,
               Rejected: 0,
               Hired: 0
          };

          jobs.forEach(job => {
               if (job.applicants) {
                    totalApplicants += job.applicants.length;
                    job.applicants.forEach(app => {
                         if (statusCounts[app.status] !== undefined) {
                              statusCounts[app.status]++;
                         }
                    });
               }
          });

          // Get recent applications (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          let recentApplicants = 0;
          jobs.forEach(job => {
               job.applicants?.forEach(app => {
                    if (new Date(app.appliedAt) >= sevenDaysAgo) {
                         recentApplicants++;
                    }
               });
          });

          res.status(200).json({
               totalJobs,
               activeJobs,
               totalViews,
               totalApplicants,
               recentApplicants,
               statusBreakdown: statusCounts,
               jobsWithMostApplicants: jobs
                    .map(j => ({ id: j._id, title: j.title, applicants: j.applicants?.length || 0 }))
                    .sort((a, b) => b.applicants - a.applicants)
                    .slice(0, 5)
          });
     } catch (error) {
          console.error("Error fetching company stats:", error);
          res.status(500).json({ message: "Error fetching stats", error: error.message });
     }
};
