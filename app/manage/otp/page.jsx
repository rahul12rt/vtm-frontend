"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../login/page.module.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const router = useRouter();
  const inputRefs = useRef([]);

  const handleOtpChange = (e, index) => {
    const { value } = e.target;

    // Allow only numeric values
    if (/[^0-9]/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;

    if (index < 5 && value !== "") {
      // Move focus to next input if current value is not empty
      inputRefs.current[index + 1]?.focus();
    }

    setOtp(newOtp);
  };

  const handleSubmit = () => {
    // Here you would normally verify the OTP with your backend
    alert("Password changed successfully");
    router.push("/login");
  };

  return (
    <div className={styles["login-container"]}>
      <h2>Enter OTP</h2>
      <div className={styles.otpWrapper}>
        {otp.map((value, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength="1"
            value={value}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpChange(e, index)}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={{ width: "30px", textAlign: "center", margin: "5px" }}
          />
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={otp.some((o) => o === "")}
        className={styles["submit-button"]}
        style={{ width: "100%" }}
      >
        Submit
      </button>
    </div>
  );
};

export default OtpVerification;
