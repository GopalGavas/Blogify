import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./database/index.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error: ", error);
    });

    const PORT = process.env.PORT || 7001;
    app.listen(PORT, (req, res) => {
      console.log(`Server is listining on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed: ", error);
    throw error;
  });
