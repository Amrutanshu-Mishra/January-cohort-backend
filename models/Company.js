import mongoose from "mongoose";

const { Schema } = mongoose;

const CompanySchema = new Schema({
     clerkId: {
          type: String,
          required: true,
          unique: true,
          index: true
     },
     companyName: {
          type: String,
          required: true,
          unique: true
     },
     email: {
          type: String,
          required: true,
          unique: true
     },
     website: {
          type: String,
          required: false
     },
     description: {
          type: String,
          required: false
     },
     logo: {
          type: String,
          required: false
     },
     industry: {
          type: String,
          required: false
     },
     size: {
          type: String,
          enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
          required: false
     },
     verified: {
          type: Boolean,
          default: false
     }
}, { timestamps: true });

const Company = mongoose.model('Company', CompanySchema);

export default Company;
