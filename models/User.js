import mongoose from "mongoose";

const { Schema } = mongoose;

// Sub-schema for target jobs
const TargetJobSchema = new Schema({
     jobId: {
          type: String,
          required: false
     },
     title: {
          type: String,
          required: true
     },
     description: {
          type: String,
          required: true
     },
     company: {
          type: String,
          required: false
     },
     analysisStatus: {
          type: String,
          enum: ['Pending', 'Completed', 'Failed'],
          default: 'Pending'
     },
     // Simple skill gaps (legacy)
     skillGaps: [{
          type: String
     }],
     // Enhanced analysis results
     matchPercentage: {
          type: Number,
          min: 0,
          max: 100
     },
     matchSummary: String,
     strengths: [{
          skill: String,
          evidence: String,
          relevance: String
     }],
     criticalGaps: [{
          requirement: String,
          priority: { type: String, enum: ['Critical', 'High', 'Medium'] },
          impact: String,
          difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] }
     }],
     proficiencyGaps: [{
          skill: String,
          userLevel: String,
          requiredLevel: String,
          evidence: String
     }],
     recommendedActions: [{
          action: String,
          skill: String,
          estimatedTime: String,
          priority: Number,
          resources: [String]
     }],
     timelineAssessment: {
          estimatedTimeToReady: String,
          confidence: { type: String, enum: ['High', 'Medium', 'Low'] },
          assumptions: String
     },
     analyzedAt: Date
}, { timestamps: true });

// Main User Schema
const UserSchema = new Schema({
     clerkId: {
          type: String,
          required: true,
          unique: true,
          index: true
     },
     email: {
          type: String,
          required: true,
          unique: true
     },
     fullName: {
          type: String,
          required: false
     },
     username: {
          type: String,
          required: false
     },
     // Role field to differentiate users
     role: {
          type: String,
          enum: ['user', 'company'],
          default: 'user'
     },
     // Track if user has completed onboarding
     profileCompleted: {
          type: Boolean,
          default: false
     },
     // Professional Profile
     resume: {
          type: String,
          required: false
     },
     githubId: {
          type: String,
          required: false
     },
     githubProfile: {
          type: String,
          required: false
     },
     linkedinProfile: {
          type: String,
          required: false
     },
     portfolio: {
          type: String,
          required: false
     },
     // Resume Analysis
     resumeAnalysis: {
          skillsReview: {
               strong: [{
                    skill: String,
                    evidence: String
               }],
               weak: [{
                    skill: String,
                    reason: String
               }],
               toImprove: [{
                    skill: String,
                    current: String,
                    target: String
               }]
          },
          projectsReview: [{
               projectName: String,
               description: String,
               strong: [String],
               weak: [String],
               toImprove: [String],
               skillsDemonstrated: [String]
          }],
          overallAssessment: {
               strengths: [String],
               weaknesses: [String],
               careerLevel: String,
               recommendations: [String]
          },
          analyzedAt: Date
     },
     // Target Jobs
     targetJobs: [TargetJobSchema],
     // General Profile
     skills: [{
          type: String
     }],
     experienceLevel: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Senior'],
          default: 'Beginner'
     }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;