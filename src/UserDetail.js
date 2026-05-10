import React, { useEffect, useState } from "react";
import { addCommentToPhoto, getPhotosOfUser, getUsers } from "./api/authService";
import "./UserDetail.css";

const DEMO_LOGIN_NAMES = new Set([
  "imalcolm",
  "eripley",
  "ptook",
  "rkenobi",
  "aludgate",
  "jousterhout",
]);

const UserDetail = ({ user, refreshKey }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(user._id);
  const [selectedUser, setSelectedUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [submittingPhotoId, setSubmittingPhotoId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadPhotos(selectedUserId);
    }
  }, [selectedUserId, refreshKey]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    const selected = users.find((u) => u._id === userId);
    if (selected) {
      setSelectedUser(selected);
    }
  };

  const loadPhotos = async (userId) => {
    try {
      setPhotosLoading(true);
      const data = await getPhotosOfUser(userId);
      setPhotos(data);
    } catch (error) {
      console.error("Failed to load photos:", error);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleCommentChange = (photoId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [photoId]: value }));
    setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
  };

  const handleAddComment = async (event, photoId) => {
    event.preventDefault();
    const text = (commentDrafts[photoId] || "").trim();

    if (!text) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Bình luận không được để trống" }));
      return;
    }

    try {
      setSubmittingPhotoId(photoId);
      const createdComment = await addCommentToPhoto(photoId, text);
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo._id === photoId
            ? { ...photo, comments: [...(photo.comments || []), createdComment] }
            : photo
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [photoId]: "" }));
      setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
    } catch (error) {
      setCommentErrors((prev) => ({
        ...prev,
        [photoId]: typeof error === "string" ? error : "Không thể thêm bình luận",
      }));
    } finally {
      setSubmittingPhotoId(null);
    }
  };

  const visibleUsers = users.filter(
    (u) => u._id !== user._id && !DEMO_LOGIN_NAMES.has((u.login_name || "").toLowerCase())
  );

  return (
    <div className="user-detail-container">
      <div className="users-list">
        <div className="current-account-panel">
          <p className="current-account-title">Tài khoản đang đăng nhập</p>
          <button
            type="button"
            className={`current-account-card ${selectedUserId === user._id ? "active" : ""}`}
            onClick={() => handleUserSelect(user._id)}
          >
            <div className="user-name">
              {user.first_name} {user.last_name}
            </div>
            <div className="user-occupation">{user.occupation}</div>
          </button>
        </div>

        <h2>Danh sách người dùng</h2>
        <ul className="users-list-items">
          {visibleUsers.map((u) => (
            <li
              key={u._id}
              className={`user-item ${selectedUserId === u._id ? "active" : ""}`}
              onClick={() => handleUserSelect(u._id)}
            >
              <div className="user-item-content">
                <div className="user-name">
                  {u.first_name} {u.last_name}
                </div>
                <div className="user-occupation">{u.occupation}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="user-info">
        {selectedUser ? (
          <div className={`user-card ${selectedUserId === user._id ? "is-current-user" : ""}`}>
            <div className="user-card-header">
              <h2>
                {selectedUser.first_name} {selectedUser.last_name}
              </h2>
              {selectedUserId === user._id && (
                <div className="user-card-badge">Tài khoản của bạn</div>
              )}
            </div>

            <div className="photo-section">
              <h3>Ảnh và bình luận</h3>
              {photosLoading ? (
                <p>Đang tải ảnh...</p>
              ) : photos.length === 0 ? (
                <p>Người dùng này chưa có ảnh.</p>
              ) : (
                <div className="photo-list">
                  {photos.map((photo) => (
                    <div key={photo._id} className="photo-card">
                      <div className="photo-header">
                        <div className="photo-main-info">
                          {photo.description ? (
                            <p className="photo-description">{photo.description}</p>
                          ) : null}
                        </div>
                        <span className="photo-date">
                          {new Date(photo.date_time).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <img
                        className="photo-image"
                        src={`/images/${photo.file_name}`}
                        alt={photo.description || photo.file_name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                        }}
                      />
                      <div className="photo-no-image" style={{display:"none"}}>Ảnh không tồn tại</div>

                      <div className="comments-block">
                        <h4>Bình luận</h4>
                        {(photo.comments || []).length === 0 ? (
                          <p className="no-comments">Chưa có bình luận nào.</p>
                        ) : (
                          <ul className="comment-list">
                            {(photo.comments || []).map((cmt) => (
                              <li key={cmt._id} className="comment-item">
                                <span className="comment-author">
                                  {cmt.user?.first_name} {cmt.user?.last_name}
                                </span>
                                <span className="comment-text">{cmt.comment}</span>
                                <span className="comment-date">
                                  {new Date(cmt.date_time).toLocaleString("vi-VN")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <form className="add-comment-form" onSubmit={(e) => handleAddComment(e, photo._id)}>
                        <input
                          type="text"
                          placeholder="Thêm bình luận..."
                          value={commentDrafts[photo._id] || ""}
                          onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                          disabled={submittingPhotoId === photo._id}
                        />
                        <button type="submit" disabled={submittingPhotoId === photo._id}>
                          {submittingPhotoId === photo._id ? "Đang gửi..." : "Gửi"}
                        </button>
                      </form>
                      {commentErrors[photo._id] ? (
                        <p className="comment-error">{commentErrors[photo._id]}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p>Chọn một người dùng để xem chi tiết</p>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
