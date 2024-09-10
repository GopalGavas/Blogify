import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { blogId } = req.params;

  if (!blogId) {
    res.status(400).redirect(`/blog/${blogId}`, { error: "Invalid Id" });
  }

  if (!content) {
    res
      .status(400)
      .redirect(`/blog/${blogId}`, { error: "content is required" });
  }

  const comment = await Comment.create({
    content,
    blog: blogId,
    createdBy: req.user?._id,
  });

  if (!comment) {
    return res.status(500).redirect(`/blog/${blog._id}`, {
      error: "Something went wrong while creating the comment",
    });
  }

  return res.status(200).redirect(`/blog/${blogId}`);
});

export { createComment };
