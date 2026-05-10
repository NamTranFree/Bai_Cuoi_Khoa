const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.get("/photosOfUser/:user_id", isAuthenticated, async (request, response) => {
	try {
		const { user_id } = request.params;
		if (!mongoose.Types.ObjectId.isValid(user_id)) {
			return response.status(400).json({ error: "Invalid user id" });
		}

		const photos = await Photo.find({ user_id }).sort({ date_time: -1 }).lean();

		const commenterIds = [
			...new Set(
				photos
					.flatMap((photo) => photo.comments || [])
					.map((comment) => String(comment.user_id))
			),
		];

		const commenters = await User.find({ _id: { $in: commenterIds } })
			.select("first_name last_name")
			.lean();
		const commenterMap = new Map(commenters.map((u) => [String(u._id), u]));

		const photoPayload = photos.map((photo) => ({
			_id: photo._id,
			file_name: photo.file_name,
			description: photo.description || "",
			date_time: photo.date_time,
			user_id: photo.user_id,
			comments: (photo.comments || []).map((comment) => ({
				_id: comment._id,
				comment: comment.comment,
				date_time: comment.date_time,
				user: commenterMap.get(String(comment.user_id))
					? {
							_id: comment.user_id,
							first_name: commenterMap.get(String(comment.user_id)).first_name,
							last_name: commenterMap.get(String(comment.user_id)).last_name,
						}
					: {
							_id: comment.user_id,
							first_name: "Unknown",
							last_name: "User",
						},
			})),
		}));

		response.json(photoPayload);
	} catch (error) {
		response.status(400).json({ error: error.message });
	}
});

router.post("/commentsOfPhoto/:photo_id", isAuthenticated, async (request, response) => {
	try {
		const { photo_id } = request.params;
		const commentText = typeof request.body.comment === "string" ? request.body.comment.trim() : "";

		if (!commentText) {
			return response.status(400).json({ error: "Comment must not be empty" });
		}
		if (!mongoose.Types.ObjectId.isValid(photo_id)) {
			return response.status(400).json({ error: "Invalid photo id" });
		}

		const photo = await Photo.findById(photo_id);
		if (!photo) {
			return response.status(404).json({ error: "Photo not found" });
		}

		const newComment = {
			comment: commentText,
			user_id: request.session.userId,
			date_time: new Date(),
		};

		photo.comments.push(newComment);
		await photo.save();

		const createdComment = photo.comments[photo.comments.length - 1];
		const currentUser = await User.findById(request.session.userId).select("first_name last_name").lean();

		response.json({
			_id: createdComment._id,
			comment: createdComment.comment,
			date_time: createdComment.date_time,
			user: {
				_id: request.session.userId,
				first_name: currentUser?.first_name || "Unknown",
				last_name: currentUser?.last_name || "User",
			},
			photo_id,
		});
	} catch (error) {
		response.status(400).json({ error: error.message });
	}
});

module.exports = router;
