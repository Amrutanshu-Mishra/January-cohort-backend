import { createRequire } from 'module';
import https from 'https';
import http from 'http';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Download and extract text from PDF URL
 */
export const extractPDFText = async (url) => {
     return new Promise((resolve, reject) => {
          const protocol = url.startsWith('https') ? https : http;

          protocol.get(url, (response) => {
               const chunks = [];

               response.on('data', (chunk) => chunks.push(chunk));

               response.on('end', async () => {
                    try {
                         const buffer = Buffer.concat(chunks);
                         const data = await pdf(buffer);
                         resolve(data.text);
                    } catch (error) {
                         reject(error);
                    }
               });
          }).on('error', reject);
     });
};
