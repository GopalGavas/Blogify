import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error: ", error);
    throw new ApiError(
      500,
      "Something went wrong while genrating access and refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // ask for fields
  const { fullName, email, password } = req.body;

  //  validate fields
  if ([fullName, email, password].some((fields) => fields.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Invalid email address");
  }

  // Check for existing User
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  // file uploads
  let coverImageLocalPath;
  if (req.file) {
    coverImageLocalPath = req.file?.path;
    console.log("file path: ", coverImageLocalPath);
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    fullName,
    email,
    password,
    coverImage: coverImage?.url || "",
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  const userCreated = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, userCreated, "User registered successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("400", "Email and Password is  required");
  }

  const user = await User.findOne({ email }).select("-refreshToken");

  if (!user) {
    throw new ApiError(404, "user  not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  user.refreshToken = refreshToken;
  await user.save();

  user.password = undefined;
  user.refreshToken = undefined;

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggoed out successfully"));
});

export { registerUser, userLogin, userLogout };
