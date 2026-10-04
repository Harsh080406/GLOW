import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb+srv://24bt04037_db_user:ftxpufkMKxu27Ca7@glowcluster.hccjtza.mongodb.net/test?retryWrites=true&w=majority";

  try {
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Initial Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
