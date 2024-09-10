import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyjwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access token");
  }
});

export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // console.log("Checking for token...");
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // console.log("No token found, proceeding without user");
      return next();
    }

    // console.log("Token found, verifying...");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log("Token verified, fetching user...");
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (user) {
      // console.log("User found, adding to req");
      req.user = user;
    }

    next();
  } catch (error) {
    console.log(
      "Error occurred during token verification, proceeding without user",
      error.message
    );
    next(); // Continue if there's an error
  }
});
