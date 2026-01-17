import { uploadToS3 } from '../services/upload.service.js';
import User from '../models/User.js';

export const uploadResume = async (req, res) => {
     try {
          const { userId } = req.auth();

          if (!req.file) {
               return res.status(400).json({ message: 'No file uploaded' });
          }

          // Upload to S3
          const fileUrl = await uploadToS3(req.file);

          // Update user profile with the new resume URL
          // Doing this automatically saves the step of the frontend making a separate call
          if (userId) {
               await User.findOneAndUpdate(
                    { clerkId: userId },
                    { $set: { resume: fileUrl } }
               );
          }

          res.status(200).json({
               message: 'Resume uploaded successfully',
               url: fileUrl
          });

     } catch (error) {
          console.error('Error uploading file:', error);
          res.status(500).json({
               message: 'Error uploading file',
               error: error.message
          });
     }
};
