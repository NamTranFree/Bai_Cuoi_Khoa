import React, { useState } from "react";
import Toolbar from "./Toolbar";
import LoginRegister from "./LoginRegister";
import UserDetail from "./UserDetail";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handlePhotoUploaded = (newPhoto) => {
    // Trigger refresh of photos in UserDetail by changing key
    setPhotoRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app">
      <Toolbar
        user={user}
        onLogout={handleLogout}
        onPhotoUploaded={handlePhotoUploaded}
      />
      <div className="app-content">
        {user ? (
          <UserDetail user={user} refreshKey={photoRefreshKey} />
        ) : (
          <LoginRegister onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default App;
