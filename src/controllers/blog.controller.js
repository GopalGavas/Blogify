import { asyncHandler } from "../utils/asyncHandler.js";
import { Blog } from "../models/blog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createBlog = asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  console.log(req.body);

  if ([title, body].some((fields) => fields.trim() === "")) {
    return res
      .status(400)
      .render("addBlog", { error: "Title and body is  required" });
  }

  let coverImageLocalPath;
  if (req.file) {
    coverImageLocalPath = req.file?.path;
    console.log("coverImagePath: ", coverImageLocalPath);
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const blog = await Blog.create({
    title,
    body,
    coverImage: coverImage?.url || "",
    createdBy: req.user?._id,
  });

  if (!blog) {
    return res.status(500).render("addBlog", {
      error: "something went wrong while creating the blog",
    });
  }

  return res.redirect(`/blog/${blog._id}`);
});

const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(400).render("home", { error: "Invalid Id" });
  }

  const blog = await Blog.findById(blogId);

  if (!blog) {
    return res.status(404).render("home", { error: "blog not found" });
  }

  return res.status(200).render("blog", { user: req.user, blog });
});

export { createBlog, getBlogById };
