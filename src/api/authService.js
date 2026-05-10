import axios from "axios";

const API_BASE = "http://localhost:8082";

/**
 * Login with login_name and password
 * Returns user info if successful
 */
export const login = async (login_name, password) => {
  try {
    const response = await axios.post(`${API_BASE}/admin/login`, 
      { login_name, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed";
  }
};

/**
 * Register a new user
 * Returns user info if successful
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE}/user`, 
      userData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Registration failed";
  }
};

/**
 * Logout the current user
 */
export const logout = async () => {
  try {
    await axios.post(`${API_BASE}/admin/logout`, {}, 
      { withCredentials: true }
    );
  } catch (error) {
    throw error.response?.data?.error || "Logout failed";
  }
};

/**
 * Get list of all users (requires authentication)
 */
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/user`, 
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch users";
  }
};

/**
 * Get user detail by ID (requires authentication)
 */
export const getUserDetail = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/user/${userId}`, 
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch user";
  }
};

/**
 * Get photos and comments of a user
 */
export const getPhotosOfUser = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/photo/photosOfUser/${userId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch photos";
  }
};

/**
 * Add comment to photo
 */
export const addCommentToPhoto = async (photoId, comment) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/photo/commentsOfPhoto/${photoId}`,
      { comment },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to add comment";
  }
};

/**
 * Upload a new photo
 */
export const uploadPhoto = async (file, description = "") => {
  try {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("description", description);
    
    const response = await axios.post(
      `${API_BASE}/photos/new`,
      formData,
      { 
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to upload photo";
  }
};
