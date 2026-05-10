import React, { useState } from "react";
import { uploadPhoto } from "./api/authService";
import "./UploadPhotoModal.css";

const UploadPhotoModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp ảnh hợp lệ");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Vui lòng chọn một ảnh");
      return;
    }

    try {
      setLoading(true);
      const uploadedPhoto = await uploadPhoto(file, description);
      onUploadSuccess(uploadedPhoto);
      setFile(null);
      setPreview(null);
      setDescription("");
      setError("");
      onClose();
    } catch (err) {
      setError(typeof err === "string" ? err : "Lỗi tải ảnh lên");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h2>Tải ảnh mới</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button
                type="button"
                className="change-btn"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              >
                Chọn ảnh khác
              </button>
            </div>
          ) : (
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              <span className="file-input-text">
                Nhấp để chọn ảnh hoặc kéo thả ảnh ở đây
              </span>
            </label>
          )}

          <div className="description-group">
            <label htmlFor="photoDescription">Mô tả ảnh</label>
            <textarea
              id="photoDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả cho ảnh (không bắt buộc)"
              disabled={loading}
              rows={3}
              maxLength={300}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="upload-modal-footer">
            <button type="button" onClick={onClose} disabled={loading} className="cancel-btn">
              Hủy
            </button>
            <button type="submit" disabled={loading || !file} className="upload-btn">
              {loading ? "Đang tải..." : "Tải lên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
