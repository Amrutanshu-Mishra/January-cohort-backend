import Company from '../models/Company.js';

// Middleware to ensure the authenticated user is a company account
export const requireCompanyAuth = async (req, res, next) => {
     try {
          const { userId } = req.auth();

          if (!userId) {
               return res.status(401).json({ message: "Unauthorized" });
          }

          // Check if this Clerk ID belongs to a company
          const company = await Company.findOne({ clerkId: userId });

          if (!company) {
               return res.status(403).json({
                    message: "Access denied. Company account required."
               });
          }

          // Attach company to request for use in controllers
          req.company = company;
          next();
     } catch (error) {
          console.error("Error in company auth middleware:", error);
          res.status(500).json({ message: "Authentication error", error: error.message });
     }
};
