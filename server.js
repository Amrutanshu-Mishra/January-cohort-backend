import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './db/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import webhook routes (must be before json middleware for raw body)
import webhookRoutes from './routes/webhook.routes.js';
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// Enable CORS manually since npm install failed
app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
     if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
          return res.status(200).json({});
     }
     next();
});

// Clerk Middleware - This checks the Authorization header for a valid token
// It doesn't block the request, but populates req.auth
app.use(clerkMiddleware());

// Database Connection
// Database Connection
connectDB();

// Import routes
import exampleRoutes from './routes/example.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import jobRoutes from './routes/job.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Use routes
app.use('/api', exampleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/upload', uploadRoutes);

// Test Route
app.get('/', (req, res) => {
     res.send('Backend is running!');
});

// Protected Route Example
app.get('/protected', (req, res) => {
     const { userId } = req.auth();
     if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
     }
     res.json({ message: "This is a protected route", userId: userId });
});

app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
});
