
import mongoose from "mongoose";

export const connectDB = async () => {
     try {
          if (!process.env.MONGO_URI) {
               console.error("Error: MONGO_URI is not defined.");
               process.exit(1);
          }
          console.log("Attempting to connect to MongoDB...");
          const conn = await mongoose.connect(process.env.MONGO_URI);
          console.log(`MongoDB Connected: ${conn.connection.host}`);
     } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
     }
};
