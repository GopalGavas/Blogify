import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}`
    );
    console.log(
      `database connection successfully! connection host: ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("MongoDB connection failed: ", error);
    process.exit(1);
  }
};

export { connectDB };
