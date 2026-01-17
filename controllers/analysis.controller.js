import User from '../models/User.js';
import Job from '../models/Job.js';
import { analyzeResume, analyzeSkillGap } from '../services/gemini.service.js';

// Analyze user's resume
export const performResumeAnalysis = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const user = await User.findOne({ clerkId: userId });

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          // Perform AI analysis
          const result = await analyzeResume(user);

          if (!result.success) {
               return res.status(500).json({
                    message: "Analysis failed",
                    error: result.error
               });
          }

          // Save analysis to user profile
          user.resumeAnalysis = {
               ...result.analysis,
               analyzedAt: new Date()
          };

          await user.save();

          res.status(200).json({
               message: "Resume analysis completed successfully",
               analysis: user.resumeAnalysis
          });
     } catch (error) {
          console.error("Error in resume analysis:", error);
          res.status(500).json({ message: "Error analyzing resume", error: error.message });
     }
};

// Get resume analysis results
export const getResumeAnalysis = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const user = await User.findOne({ clerkId: userId }).select('resumeAnalysis');

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          if (!user.resumeAnalysis || !user.resumeAnalysis.analyzedAt) {
               return res.status(404).json({
                    message: "No resume analysis found. Please run analysis first."
               });
          }

          res.status(200).json({ analysis: user.resumeAnalysis });
     } catch (error) {
          console.error("Error fetching resume analysis:", error);
          res.status(500).json({ message: "Error fetching analysis", error: error.message });
     }
};

// Analyze a specific target job
export const performJobAnalysis = async (req, res) => {
     try {
          const { userId } = req.auth();
          const { targetJobId } = req.params;

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const user = await User.findOne({ clerkId: userId });

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          // Find the target job in user's list
          const targetJob = user.targetJobs.id(targetJobId);

          if (!targetJob) {
               return res.status(404).json({ message: "Target job not found" });
          }

          // Get full job details if jobId is available
          let fullJobDetails = null;
          if (targetJob.jobId) {
               fullJobDetails = await Job.findById(targetJob.jobId);
          }

          // Use full job details or target job data
          const jobData = fullJobDetails || targetJob;

          // Perform AI analysis
          const result = await analyzeSkillGap(user, jobData, user.resumeAnalysis);

          if (!result.success) {
               targetJob.analysisStatus = 'Failed';
               await user.save();

               return res.status(500).json({
                    message: "Analysis failed",
                    error: result.error
               });
          }

          // Update target job with analysis results
          targetJob.analysisStatus = 'Completed';
          targetJob.matchPercentage = result.analysis.matchPercentage;
          targetJob.matchSummary = result.analysis.matchSummary;
          targetJob.strengths = result.analysis.strengths;
          targetJob.criticalGaps = result.analysis.criticalGaps;
          targetJob.proficiencyGaps = result.analysis.proficiencyGaps;
          targetJob.recommendedActions = result.analysis.recommendedActions;
          targetJob.timelineAssessment = result.analysis.timelineAssessment;
          targetJob.analyzedAt = new Date();

          await user.save();

          res.status(200).json({
               message: "Job analysis completed successfully",
               analysis: {
                    matchPercentage: targetJob.matchPercentage,
                    matchSummary: targetJob.matchSummary,
                    strengths: targetJob.strengths,
                    criticalGaps: targetJob.criticalGaps,
                    proficiencyGaps: targetJob.proficiencyGaps,
                    recommendedActions: targetJob.recommendedActions,
                    timelineAssessment: targetJob.timelineAssessment,
                    analyzedAt: targetJob.analyzedAt
               }
          });
     } catch (error) {
          console.error("Error in job analysis:", error);
          res.status(500).json({ message: "Error analyzing job", error: error.message });
     }
};

// Get job analysis results
export const getJobAnalysis = async (req, res) => {
     try {
          const { userId } = req.auth();
          const { targetJobId } = req.params;

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const user = await User.findOne({ clerkId: userId });

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          const targetJob = user.targetJobs.id(targetJobId);

          if (!targetJob) {
               return res.status(404).json({ message: "Target job not found" });
          }

          if (targetJob.analysisStatus !== 'Completed') {
               return res.status(404).json({
                    message: "No analysis found for this job. Please run analysis first.",
                    status: targetJob.analysisStatus
               });
          }

          res.status(200).json({
               analysis: {
                    matchPercentage: targetJob.matchPercentage,
                    matchSummary: targetJob.matchSummary,
                    strengths: targetJob.strengths,
                    criticalGaps: targetJob.criticalGaps,
                    proficiencyGaps: targetJob.proficiencyGaps,
                    recommendedActions: targetJob.recommendedActions,
                    timelineAssessment: targetJob.timelineAssessment,
                    analyzedAt: targetJob.analyzedAt
               }
          });
     } catch (error) {
          console.error("Error fetching job analysis:", error);
          res.status(500).json({ message: "Error fetching analysis", error: error.message });
     }
};
