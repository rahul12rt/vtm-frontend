"use client";
import { useRouter } from "next/navigation";
import React from "react";
import styles from "./Success.module.css"; // Import the CSS module

const Success = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/student-portal");
  };

  return (
    <div className="container">
      <div className={styles.card}>
        {" "}
        {/* Apply the CSS module class */}
        <div>
          <h1 className={styles.title}>Test Submitted Successfully!</h1>
          <p className={styles.message}>
            🎉 Great job! You’ve successfully completed the test. <br />
            All your hard work and preparation have paid off, and your answers
            have been recorded.
          </p>
          <p className={styles.subMessage}>
            Your results will be evaluated soon. Keep up the good work, and
            continue learning and growing! 📚
          </p>
          <button className={styles.button} onClick={handleClick}>
            Back to Dashboard
          </button>
        </div>
        <div>
          <img
            src="/images/success.jpg"
            alt="Success Illustration"
            className={styles.image} // Apply the CSS module class
          />
        </div>
      </div>
    </div>
  );
};

export default Success;
