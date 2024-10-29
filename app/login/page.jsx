"use client";
import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link from next/link
import styles from "./page.module.css";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import CryptoJS from "crypto-js";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [disable, setDisable] = useState(false);

  const router = useRouter();
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
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
      try {
        // Preparing the payload
        const payload = {
          identifier: formData.username, // username is mapped to identifier
          password: formData.password,
        };
        setDisable(true);

        // Making the POST request
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login failed");
        }

        // Assuming the response contains user data or a success message
        const data = await response.json();
        const jwtToken = data.jwt;
        Cookies.set("token", jwtToken, { expires: 7, secure: true });

        const userId = data.user.id;
        console.log(data);
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const userEndpoint = `${strapiApiUrl}/api/users/${userId}?populate=*`;
        const userResponse = await fetch(userEndpoint, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await userResponse.json();

        toast.success("Login successful!");
        if (userData.role.type === "student") {
          const encryptedUsername = CryptoJS.AES.encrypt(
            userData.username,
            encryptionKey
          ).toString();
          Cookies.set("user", encryptedUsername, {
            expires: 7,
            secure: true,
          });
          router.push(`/student-portal`);
        } else if (userData.role.type === "college") {
          const encryptedUsername = CryptoJS.AES.encrypt(
            userData.username,
            encryptionKey
          ).toString();
          Cookies.set("user", encryptedUsername, {
            expires: 7,
            secure: true,
          });
          router.push(`/college-portal`);
        }
      } catch (error) {
        toast.error(error.message || "An error occurred during login"); // Show error message
      }
    }
  };

  return (
    <div className={styles["login-container"]}>
      <Toaster position="top-right" reverseOrder={false} />
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
        <button
          type="submit"
          className={styles["submit-button"]}
          disabled={disable}
          style={{ cursor: disable ? "no-drop" : "pointer" }}
        >
          {disable ? "..." : "Login"}
        </button>
        <p className={styles.forgotPassword}>
          <Link href="/manage/password">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
