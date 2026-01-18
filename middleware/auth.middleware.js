import { clerkClient } from '@clerk/express';

// Middleware to ensure the user is authenticated
export const requireAuth = (req, res, next) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    console.log('Auth check - userId:', userId ? userId.substring(0, 20) + '...' : 'null');

    if (!userId) {
      console.log('No userId found in auth. Headers:', req.headers.authorization ? 'Present' : 'Missing');
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Optional: Middleware to fetch full user details from Clerk if needed
export const attachUser = async (req, res, next) => {
  const { userId } = req.auth();
  if (!userId) {
    return next();
  }
  try {
    const user = await clerkClient.users.getUser(userId);
    req.user = user;
    next();
  } catch (error) {
    console.error("Error fetching user details from Clerk:", error);
    next();
  }
}