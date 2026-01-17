import { clerkClient } from '@clerk/express';

// Middleware to ensure the user is authenticated
export const requireAuth = (req, res, next) => {
  if (!req.auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Optional: Middleware to fetch full user details from Clerk if needed
export const attachUser = async (req, res, next) => {
  if (!req.auth.userId) {
    return next();
  }
  try {
    const user = await clerkClient.users.getUser(req.auth.userId);
    req.user = user;
    next();
  } catch (error) {
    console.error("Error fetching user details from Clerk:", error);
    next();
  }
}