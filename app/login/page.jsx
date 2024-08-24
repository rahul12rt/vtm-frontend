"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  const validateUsername = (username) => {
    const usernameRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return usernameRegex.test(username);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { username: "", password: "" };

    if (!formData.username) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      console.log(formData);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <form onSubmit={handleSubmit} className={styles["login-form"]}>
        <h2>Login to your Account</h2>
        <div className={styles["form-group"]}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && (
            <span className={styles.error}>{errors.username}</span>
          )}
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="password">Password</label>
          <div className={styles["password-container"]}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles["eye-icon"]}
            >
              {showPassword ? (
                <img src="/images/icons/eye.svg" alt="hide" />
              ) : (
                <img src="/images/icons/eyeDisable.svg" alt="show" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className={styles.error}>{errors.password}</span>
          )}
        </div>
        <button type="submit" className={styles["submit-button"]}>
          Login
        </button>
        {/* <p className={styles.register}>
          Don't have an account?{" "}
          <a href="/college-register">Register for free</a>
        </p> */}
      </form>
    </div>
  );
};

export default Login;
