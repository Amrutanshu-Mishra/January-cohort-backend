import { clerkClient } from '@clerk/express';

// Middleware to ensure the user is authenticated
export const requireAuth = (req, res, next) => {
  const { userId } = req.auth();

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
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