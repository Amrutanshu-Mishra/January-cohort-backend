import User from '../models/User.js';
import { clerkClient } from '@clerk/express';

// Sync user from Clerk to MongoDB
export const syncUser = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          // Check if user already exists
          let user = await User.findOne({ clerkId: userId });

          if (!user) {
               // Fetch user info from Clerk API
               let clerkUser;
               try {
                    clerkUser = await clerkClient.users.getUser(userId);
               } catch (clerkError) {
                    console.error("Error fetching user from Clerk:", clerkError);
                    return res.status(500).json({ message: "Could not fetch user info" });
               }

               const email = clerkUser.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
               const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();

               if (!email) {
                    return res.status(400).json({ message: "User email not found" });
               }

               // Create new user
               user = await User.create({
                    clerkId: userId,
                    email: email,
                    fullName: fullName,
                    username: clerkUser.username || '',
                    role: 'user'
               });

               // Sync with Clerk: Set role to 'user' in publicMetadata
               try {
                    await clerkClient.users.updateUserMetadata(userId, {
                         publicMetadata: {
                              role: 'user',
                              userId: user._id.toString()
                         }
                    });
               } catch (clerkError) {
                    console.error("Error updating Clerk metadata:", clerkError);
                    // Continue - we don't want to fail the whole request if just metadata fails
               }
          }

          res.status(200).json({
               message: "User synced successfully",
               user,
               role: 'user'
          });
     } catch (error) {
          console.error("Error syncing user:", error);
          res.status(500).json({ message: "Error syncing user", error: error.message });
     }
};



// Update user profile
export const updateProfile = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const {
               fullName,
               username,
               resume,
               githubId,
               githubProfile,
               linkedinProfile,
               portfolio,
               skills,
               experienceLevel
          } = req.body;

          const user = await User.findOneAndUpdate(
               { clerkId: userId },
               {
                    $set: {
                         fullName,
                         username,
                         resume,
                         githubId,
                         githubProfile,
                         linkedinProfile,
                         portfolio,
                         skills,
                         experienceLevel
                    }
               },
               { new: true, runValidators: true }
          );

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          res.status(200).json({
               message: "Profile updated successfully",
               user
          });
     } catch (error) {
          console.error("Error updating profile:", error);
          res.status(500).json({ message: "Error updating profile", error: error.message });
     }
};

// Get user profile
export const getProfile = async (req, res) => {
     try {
          const { userId } = req.auth();
          console.log(userId);
          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const user = await User.findOne({ clerkId: userId });

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          res.status(200).json({ user });
     } catch (error) {
          console.error("Error fetching profile:", error);
          res.status(500).json({ message: "Error fetching profile", error: error.message });
     }
};

// Add a target job
export const addTargetJob = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const { jobId, title, description, company } = req.body;

          if (!title || !description) {
               return res.status(400).json({ message: "Title and description are required" });
          }

          const user = await User.findOneAndUpdate(
               { clerkId: userId },
               {
                    $push: {
                         targetJobs: {
                              jobId,
                              title,
                              description,
                              company,
                              analysisStatus: 'Pending',
                              skillGaps: []
                         }
                    }
               },
               { new: true, runValidators: true }
          );

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          res.status(200).json({
               message: "Target job added successfully",
               user
          });
     } catch (error) {
          console.error("Error adding target job:", error);
          res.status(500).json({ message: "Error adding target job", error: error.message });
     }
};

// Update target job analysis
export const updateJobAnalysis = async (req, res) => {
     try {
          const { userId } = req.auth();
          const { jobId } = req.params;

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          const { analysisStatus, skillGaps } = req.body;

          const user = await User.findOneAndUpdate(
               {
                    clerkId: userId,
                    'targetJobs._id': jobId
               },
               {
                    $set: {
                         'targetJobs.$.analysisStatus': analysisStatus,
                         'targetJobs.$.skillGaps': skillGaps
                    }
               },
               { new: true, runValidators: true }
          );

          if (!user) {
               return res.status(404).json({ message: "User or job not found" });
          }

          res.status(200).json({
               message: "Job analysis updated successfully",
               user
          });
     } catch (error) {
          console.error("Error updating job analysis:", error);
          res.status(500).json({ message: "Error updating job analysis", error: error.message });
     }
};
