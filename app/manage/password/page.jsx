"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../login/page.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Validate email format
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // Reset error message when the user types
    if (emailValue === "") {
      setErrorMessage("Email is required");
    } else if (!validateEmail(emailValue)) {
      setErrorMessage("Invalid email address");
    } else {
      setErrorMessage("");
    }
  };

  const handleSubmit = () => {
    if (!email) {
      setErrorMessage("Email is required");
    } else if (!validateEmail(email)) {
      setErrorMessage("Invalid email address");
    } else {
      // Trigger password reset process
      router.push("/manage/otp");
    }
  };

  return (
    <div className={styles["login-container"]}>
      <form
        className={styles["login-form"]}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2>Forgot Password</h2>
        <div className={styles["form-group"]}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your registered email address"
            value={email}
            onChange={handleEmailChange}
          />
          {errorMessage && <span className={styles.error}>{errorMessage}</span>}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!!errorMessage}
          className={styles["submit-button"]}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
