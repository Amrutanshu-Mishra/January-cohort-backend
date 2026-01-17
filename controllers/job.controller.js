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
               postedBy: company._id,
               title,
               description,
               requirements: requirements || [],
               location,
               type,
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
