import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3 Client
const s3Client = new S3Client({
     region: process.env.AWS_REGION,
     credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     },
});

// Configure Multer to use memory storage temporarily
const storage = multer.memoryStorage();

// Filter for PDF files only (since it's for resumes)
const fileFilter = (req, file, cb) => {
     if (file.mimetype === 'application/pdf') {
          cb(null, true);
     } else {
          cb(new Error('Invalid file type, only PDF is allowed!'), false);
     }
};

export const upload = multer({
     storage: storage,
     fileFilter: fileFilter,
     limits: {
          fileSize: 5 * 1024 * 1024 // 5MB limit
     }
});

// Helper function to upload file to S3
export const uploadToS3 = async (file) => {
     const fileName = `resumes/${Date.now()}-${file.originalname}`;

     const upload = new Upload({
          client: s3Client,
          params: {
               Bucket: process.env.AWS_BUCKET_NAME,
               Key: fileName,
               Body: file.buffer,
               ContentType: file.mimetype,
               // ACL: 'public-read' // Uncomment if you want public read access, but better to keep private or use strict bucket policies
          },
     });

     await upload.done();

     // Return the URL
     // access pattern: https://{bucket}.s3.{region}.amazonaws.com/{key}
     const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

     return location;
};
