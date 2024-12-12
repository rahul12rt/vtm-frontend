"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from '../CollegePortal.module.css'

function TestResults() {
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
  </div>
  </div>
  )
}

export default TestResults
