import PDFParser from 'pdf2json';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

// Configure AWS S3 Client
const s3Client = new S3Client({
     region: process.env.AWS_REGION,
     credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     },
});

/**
 * Download PDF from S3 using AWS SDK (handles private buckets)
 */
const downloadFromS3 = async (url) => {
     // Parse the S3 URL to get bucket and key
     // URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
     const urlObj = new URL(url);
     const bucket = urlObj.hostname.split('.')[0];
     const key = decodeURIComponent(urlObj.pathname.slice(1)); // Remove leading '/'

     console.log('Downloading from S3:', { bucket, key });

     const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
     });

     const response = await s3Client.send(command);

     // Convert stream to buffer
     const chunks = [];
     for await (const chunk of response.Body) {
          chunks.push(chunk);
     }
     return Buffer.concat(chunks);
};

/**
 * Download PDF from a generic URL (for non-S3 URLs)
 */
const downloadFromUrl = async (url) => {
     return new Promise((resolve, reject) => {
          const protocol = url.startsWith('https') ? https : http;

          protocol.get(url, (response) => {
               if (response.statusCode === 301 || response.statusCode === 302) {
                    // Handle redirect
                    return downloadFromUrl(response.headers.location).then(resolve).catch(reject);
               }

               if (response.statusCode !== 200) {
                    return reject(new Error(`HTTP ${response.statusCode}: Failed to download PDF`));
               }

               const chunks = [];
               response.on('data', (chunk) => chunks.push(chunk));
               response.on('end', () => resolve(Buffer.concat(chunks)));
          }).on('error', reject);
     });
};

/**
 * Download and extract text from PDF URL
 */
export const extractPDFText = async (url) => {
     try {
          console.log('Extracting PDF from:', url);

          let buffer;

          // Check if it's an S3 URL from our bucket
          if (url.includes('.s3.') && url.includes('amazonaws.com')) {
               buffer = await downloadFromS3(url);
          } else {
               buffer = await downloadFromUrl(url);
          }

          console.log('Downloaded PDF, size:', buffer.length, 'bytes');

          // Parse using pdf2json
          return new Promise((resolve, reject) => {
               const pdfParser = new PDFParser(this, 1); // 1 = raw text content

               pdfParser.on("pdfParser_dataError", (errData) => {
                    console.error("PDF Parser Error:", errData.parserError);
                    reject(errData.parserError);
               });

               pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    const text = pdfParser.getRawTextContent();
                    console.log('PDF extraction successful, text length:', text?.length || 0);
                    resolve(text);
               });

               pdfParser.parseBuffer(buffer);
          });
     } catch (error) {
          console.error('Error extracting PDF text:', error);
          throw error;
     }
};
