"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from '../CollegePortal.module.css'

function ExamResults() {
    const router = useRouter();

    const handleNavigation = useCallback(
      (path) => {
        router.push(path);
      },
      [router]
    );
  return (
    <div className="container">

    <div className="sectionHeader">VES – Knowledge Hub</div>
    <div className={styles.cardGrid}>
    {/* Card: Consolidated Exam Results */}
    <div className={styles.card}>
      <h2>Consolidated Exam Results</h2>
      <div className={styles.buttonGrid}>
        <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/consolidated-exam/jee")
          }
        >
          <i className="fas fa-file-alt"></i> JEE
        </button>
        <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/consolidated-exam/neet")
          }
        >
          <i className="fas fa-file-alt"></i> NEET
        </button>
        <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/consolidated-exam/cet")
          }
        >
          <i className="fas fa-file-alt"></i> CET
        </button>
        {/* <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/consolidated-exam/all")
          }
        >
          <i className="fas fa-file-alt"></i> ALL
        </button> */}
      </div>
    </div>

    {/* Card: Date and Section Wise Exam Results */}
    <div className={styles.card}>
      <h2>Date and Section Wise Exam Results</h2>
      <div className={styles.buttonGrid}>
        <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/date-section-exam/jee")
          }
        >
          <i className="fas fa-calendar-check"></i> JEE
        </button>
        <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/date-section-exam/neet")
          }
        >
          <i className="fas fa-calendar-check"></i> NEET
        </button>
        <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/date-section-exam/cet")
          }
        >
          <i className="fas fa-calendar-check"></i> CET
        </button>
        {/* <button
          className={styles.button}
          onClick={() =>
            handleNavigation("/college-portal/date-section-exam/all")
          }
        >
          <i className="fas fa-calendar-check"></i> ALL
        </button> */}
      </div>
    </div>

  </div>
  </div>
  )
}

export default ExamResults
