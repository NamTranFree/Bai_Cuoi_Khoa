import React, { useState } from "react";
import { logout } from "./api/authService";
import UploadPhotoModal from "./UploadPhotoModal";
import "./Toolbar.css";

const Toolbar = ({ user, onLogout, onPhotoUploaded }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      alert("Lỗi đăng xuất: " + error);
    }
  };

  const handleUploadSuccess = (uploadedPhoto) => {
    if (onPhotoUploaded) {
      onPhotoUploaded(uploadedPhoto);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-content">
          <div className="toolbar-user-area">
            {user ? (
              <div className="toolbar-user-info">
                <button
                  className="toolbar-add-photo-btn"
                  onClick={() => setUploadModalOpen(true)}
                >
                  Thêm ảnh
                </button>
                <span className="toolbar-greeting">
                  Chào {user.first_name} {user.last_name}
                </span>
                <button onClick={handleLogout} className="toolbar-logout-btn">
                  Đăng xuất
                </button>
              </div>
            ) : (
              null
            )}
          </div>
        </div>
      </div>

      <UploadPhotoModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default Toolbar;
