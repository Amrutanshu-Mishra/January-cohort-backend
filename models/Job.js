import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema({
     companyId: {
          type: Schema.Types.ObjectId,
          ref: 'Company',
          required: true,
          index: true
     },
     companyName: {
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
     requirements: [{
          type: String
     }],
     location: {
          type: String,
          required: false
     },
     type: {
          type: String,
          enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
          default: 'Full-time'
     },
     experienceLevel: {
          type: String,
          enum: ['Entry', 'Mid', 'Senior', 'Lead'],
          required: false
     },
     salary: {
          type: String,
          required: false
     },
     salaryRange: {
          min: {
               type: Number,
               required: false
          },
          max: {
               type: Number,
               required: false
          },
          currency: {
               type: String,
               default: 'USD'
          }
     },
     status: {
          type: String,
          enum: ['Active', 'Closed', 'Draft'],
          default: 'Active'
     },
     // Track applicants who have applied
     applicants: [{
          userId: {
               type: Schema.Types.ObjectId,
               ref: 'User'
          },
          appliedAt: {
               type: Date,
               default: Date.now
          },
          status: {
               type: String,
               enum: ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
               default: 'Applied'
          }
     }],
     // Analytics
     views: {
          type: Number,
          default: 0
     },
     postedBy: {
          type: Schema.Types.ObjectId,
          ref: 'Company',
          required: true
     }
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);

export default Job;
