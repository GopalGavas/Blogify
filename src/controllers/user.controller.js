import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

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
    return res
      .status(400)
      .render("signup", { error: "Email and Password are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).render("signup", { error: "Invalid email address" });
  }

  // Check for existing User
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).render("signup", { error: "User already exists" });
  }

  // file uploads
  let coverImageLocalPath;
  if (req.file) {
    coverImageLocalPath = req.file?.path;
    console.log("file path: ", coverImageLocalPath);
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //  create user
  const user = await User.create({
    fullName,
    email,
    password,
    coverImage: coverImage?.url || "",
  });

  if (!user) {
    return res.status(500).render("signup", {
      error: "something went wrong while creating the user",
    });
  }

  const userCreated = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  return res.status(200).redirect("/user/login");
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .render("login", { error: "Email and Password are required" });
  }

  const user = await User.findOne({ email }).select("-refreshToken");

  if (!user) {
    return res
      .status(404)
      .render("login", { error: "User not found", currentPath: "/user/login" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(404).render("login", {
      error: "Invalid password",
      currentPath: "/user/login",
    });
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
    .redirect("/home");
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
    .redirect("/user/login");
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    return res.status(400).render("updateCoverImage", {
      error: "Can't find Image Path",
      user: req.user,
    });
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    return res.status(500).render("updateCoverImage", {
      error: "Error while uploading file on cloudinary",
      user: req.user,
    });
  }

  const user = await User.findById(req.user).select("coverImage");
  const oldCoverImage = user?.coverImage;

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    {
      new: true,
    }
  );

  if (oldCoverImage) {
    const publicId = oldCoverImage.split("/").pop().split(".")[0];

    console.log(publicId);
    await deleteFromCloudinary(publicId);
  }

  return res.status(200).render("updateCoverImage", {
    success: "Cover Image updated successfully!",
    user: { coverImage: coverImage.url },
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .render("updatePassword", { error: "Password does not match" });
  }

  const user = await User.findById(req.user?._id);
  // console.log("User:", user);

  const isOldPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isOldPasswordCorrect) {
    return res
      .status(400)
      .render("updatePassword", { error: "Invalid old Password" });
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  req.flash("success", "Password updated successfully. Please login again");

  return res.status(200).redirect("/user/login");
});

export {
  registerUser,
  userLogin,
  userLogout,
  updateUserCoverImage,
  updatePassword,
};
