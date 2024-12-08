"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./CollegePortal.module.css";

const CollegePortal = () => {
  const router = useRouter();

  const handleNavigation = useCallback(
    (path) => {
      router.push(path);
    },
    [router]
  );

  return (
    <div className="container">
      {/* Header Section */}
      <header className={styles.header}>
        <h1>Welcome to Vidvat - Knowledge Hub</h1>
      </header>
      {/* Dashboard Cards */}
      <div className={styles.cardGrid}>
        {/* Card: Consolidated Test Results */}
        <div className={styles.card}>
          <h2>Consolidated Test Results</h2>
          <div className={styles.buttonGrid}>
            <button
              className={styles.button}
              onClick={() => handleNavigation("/college-portal/consolidated-test/jee")}
            >
              <i className="fas fa-chart-bar"></i> JEE
            </button>
            <button
              className={styles.button}
              onClick={() => handleNavigation("/college-portal/consolidated-test/neet")}
            >
              <i className="fas fa-chart-bar"></i> NEET
            </button>
            <button
              className={styles.button}
              onClick={() => handleNavigation("/college-portal/consolidated-test/cet")}
            >
              <i className="fas fa-chart-bar"></i> CET
            </button>
            {/* <button
              className={styles.button}
              onClick={() => handleNavigation("/college-portal/consolidated-test/all")}
            >
              <i className="fas fa-chart-bar"></i> ALL
            </button> */}
          </div>
        </div>

        {/* Card: Date and Section Wise Results */}
        <div className={styles.card}>
          <h2>Date and Section Wise Test Results</h2>
          <div className={styles.buttonGrid}>
            <button
              className={styles.button}
              onClick={() =>
                handleNavigation("/college-portal/date-section-test/jee")
              }
            >
              <i className="fas fa-calendar-alt"></i> JEE
            </button>
            <button
              className={styles.button}
              onClick={() =>
                handleNavigation("/college-portal/date-section-test/neet")
              }
            >
              <i className="fas fa-calendar-alt"></i> NEET
            </button>
            <button
              className={styles.button}
              onClick={() =>
                handleNavigation("/college-portal/date-section-test/cet")
              }
            >
              <i className="fas fa-calendar-alt"></i> CET
            </button>
            {/* <button
              className={styles.button}
              onClick={() =>
                handleNavigation("/college-portal/date-section/all")
              }
            >
              <i className="fas fa-calendar-alt"></i> ALL
            </button> */}
          </div>
        </div>

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

          <p onClick={() =>
                handleNavigation("/college-portal/reports")
              } className={styles.view}>View student wise data</p>
    
    </div>
  );
};

export default CollegePortal;
