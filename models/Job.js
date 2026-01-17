import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema({
     companyId: {
          type: Schema.Types.ObjectId,
          ref: 'Company',
          required: true,
          index: true
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
          required: false
     },
     experienceLevel: {
          type: String,
          enum: ['Entry', 'Mid', 'Senior', 'Lead'],
          required: false
     },
     salary: {
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
     postedBy: {
          type: Schema.Types.ObjectId,
          ref: 'Company',
          required: true
     }
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);

export default Job;
