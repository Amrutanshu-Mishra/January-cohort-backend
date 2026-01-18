import Company from '../models/Company.js';
import { clerkClient } from '@clerk/express';

// Register company
export const registerCompany = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          // Fetch user from Clerk to get email
          let email;
          try {
               const clerkUser = await clerkClient.users.getUser(userId);
               email = clerkUser.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
          } catch (clerkError) {
               console.error("Error fetching user from Clerk:", clerkError);
               return res.status(500).json({ message: "Could not fetch user email" });
          }

          if (!email) {
               return res.status(400).json({ message: "User email not found" });
          }

          // Check if company already exists
          let company = await Company.findOne({ clerkId: userId });

          if (company) {
               return res.status(400).json({ message: "Company already registered" });
          }

          const {
               companyName,
               website,
               description,
               logo,
               industry,
               size
          } = req.body;

          if (!companyName) {
               return res.status(400).json({ message: "Company name is required" });
          }

          // Create new company
          company = await Company.create({
               clerkId: userId,
               email: email,
               companyName,
               website,
               description,
               logo,
               industry,
               size
          });

          // Sync with Clerk: Set role to 'company' in publicMetadata
          try {
               await clerkClient.users.updateUserMetadata(userId, {
                    publicMetadata: {
                         role: 'company',
                         companyId: company._id.toString()
                    }
               });
          } catch (clerkError) {
               console.error("Error updating Clerk metadata:", clerkError);
               // Continue - we don't want to fail the whole request if just metadata fails
          }

          res.status(201).json({
               message: "Company registered successfully",
               company
          });
     } catch (error) {
          console.error("Error registering company:", error);
          res.status(500).json({ message: "Error registering company", error: error.message });
     }
};


// Get company profile
export const getCompanyProfile = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const company = await Company.findOne({ clerkId: userId });

          if (!company) {
               return res.status(404).json({ message: "Company not found" });
          }

          res.status(200).json({ company });
     } catch (error) {
          console.error("Error fetching company profile:", error);
          res.status(500).json({ message: "Error fetching company profile", error: error.message });
     }
};

// Update company profile
export const updateCompanyProfile = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const {
               companyName,
               website,
               description,
               logo,
               industry,
               size
          } = req.body;

          const company = await Company.findOneAndUpdate(
               { clerkId: userId },
               {
                    $set: {
                         companyName,
                         website,
                         description,
                         logo,
                         industry,
                         size
                    }
               },
               { new: true, runValidators: true }
          );

          if (!company) {
               return res.status(404).json({ message: "Company not found" });
          }

          res.status(200).json({
               message: "Company profile updated successfully",
               company
          });
     } catch (error) {
          console.error("Error updating company profile:", error);
          res.status(500).json({ message: "Error updating company profile", error: error.message });
     }
};
