import React, { useState } from "react";
import { login, register } from "./api/authService";
import "./LoginRegister.css";

const LoginRegister = ({ onLoginSuccess }) => {
  // Login state
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [registerTab, setRegisterTab] = useState(false);
  const [registerData, setRegisterData] = useState({
    login_name: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: ""
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const userData = await login(loginName, loginPassword);
      onLoginSuccess(userData);
    } catch (err) {
      setLoginError(typeof err === "string" ? err : "Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle register input change
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    setRegisterError("");
    setRegisterSuccess("");
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setRegisterLoading(true);

    // Validate fields
    if (!registerData.login_name.trim()) {
      setRegisterError("Tên đăng nhập là bắt buộc");
      setRegisterLoading(false);
      return;
    }
    if (!registerData.password) {
      setRegisterError("Mật khẩu là bắt buộc");
      setRegisterLoading(false);
      return;
    }
    if (!registerData.confirmPassword) {
      setRegisterError("Xác nhận mật khẩu là bắt buộc");
      setRegisterLoading(false);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Mật khẩu và xác nhận mật khẩu không khớp");
      setRegisterLoading(false);
      return;
    }
    if (!registerData.first_name.trim()) {
      setRegisterError("Tên là bắt buộc");
      setRegisterLoading(false);
      return;
    }
    if (!registerData.last_name.trim()) {
      setRegisterError("Họ là bắt buộc");
      setRegisterLoading(false);
      return;
    }

    try {
      const result = await register({
        login_name: registerData.login_name,
        password: registerData.password,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        location: registerData.location,
        description: registerData.description,
        occupation: registerData.occupation
      });

      setRegisterSuccess(`Đăng ký thành công! Vui lòng đăng nhập với tài khoản: ${result.login_name}`);
      // Clear form
      setRegisterData({
        login_name: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: ""
      });
      // Optionally switch back to login tab after success
      setTimeout(() => {
        setRegisterTab(false);
        setRegisterSuccess("");
      }, 3000);
    } catch (err) {
      setRegisterError(typeof err === "string" ? err : "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Đăng nhập / Đăng ký</h1>

        {/* Tab buttons */}
        <div className="tab-buttons">
          <button
            className={`tab-btn ${!registerTab ? "active" : ""}`}
            onClick={() => {
              setRegisterTab(false);
              setLoginError("");
            }}
            disabled={registerLoading || loginLoading}
          >
            Đăng nhập
          </button>
          <button
            className={`tab-btn ${registerTab ? "active" : ""}`}
            onClick={() => {
              setRegisterTab(true);
              setRegisterError("");
              setRegisterSuccess("");
            }}
            disabled={registerLoading || loginLoading}
          >
            Đăng ký
          </button>
        </div>

        {/* Login form */}
        {!registerTab && (
          <form onSubmit={handleLogin} className="form-content">
            <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục</p>

            <div className="form-group">
              <label htmlFor="loginName">Tên đăng nhập:</label>
              <input
                id="loginName"
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                disabled={loginLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Mật khẩu:</label>
              <input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loginLoading}
                required
              />
            </div>

            {loginError && <div className="error-message">{loginError}</div>}

            <button type="submit" disabled={loginLoading} className="login-btn">
              {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        )}

        {/* Register form */}
        {registerTab && (
          <form onSubmit={handleRegister} className="form-content">
            <p className="login-subtitle">Tạo tài khoản mới</p>

            <div className="form-group">
              <label htmlFor="regLoginName">Tên đăng nhập:</label>
              <input
                id="regLoginName"
                type="text"
                name="login_name"
                value={registerData.login_name}
                onChange={handleRegisterChange}
                placeholder="Chọn tên đăng nhập"
                disabled={registerLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regPassword">Mật khẩu:</label>
              <input
                id="regPassword"
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="Nhập mật khẩu"
                disabled={registerLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regConfirmPassword">Xác nhận mật khẩu:</label>
              <input
                id="regConfirmPassword"
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Nhập lại mật khẩu"
                disabled={registerLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regFirstName">Tên:</label>
              <input
                id="regFirstName"
                type="text"
                name="first_name"
                value={registerData.first_name}
                onChange={handleRegisterChange}
                placeholder="Nhập tên"
                disabled={registerLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regLastName">Họ:</label>
              <input
                id="regLastName"
                type="text"
                name="last_name"
                value={registerData.last_name}
                onChange={handleRegisterChange}
                placeholder="Nhập họ"
                disabled={registerLoading}
                required
              />
            </div>

            {registerError && <div className="error-message">{registerError}</div>}
            {registerSuccess && <div className="success-message">{registerSuccess}</div>}

            <button type="submit" disabled={registerLoading} className="register-btn">
              {registerLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
