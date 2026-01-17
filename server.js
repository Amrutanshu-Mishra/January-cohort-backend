import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
mongoose.connect(process.env.MONGO_URI || '')
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error('MongoDB connection error:', err));

// Import routes
import exampleRoutes from './routes/example.routes.js';

// Use routes
app.use('/api', exampleRoutes);

// Test Route
app.get('/', (req, res) => {
     res.send('Backend is running!');
});

// Protected Route Example
app.get('/protected', (req, res) => {
     if (!req.auth.userId) {
          return res.status(401).json({ error: "Unauthorized" });
     }
     res.json({ message: "This is a protected route", userId: req.auth.userId });
});

app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
});
