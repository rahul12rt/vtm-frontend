"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaGraduationCap, FaBook, FaChartBar } from "react-icons/fa";
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

        <div className="sectionHeader">Welcome to VES – Knowledge Hub</div>
  

      {/* Dashboard Cards */}
      <div className={styles.cardGrid}>
        <div
          className={styles.dcard}
          onClick={() => handleNavigation("/college-portal/test-result")}
        >
          <FaGraduationCap className={styles.dicon} />
          <h3>Test Results</h3>
        </div>

        <div
          className={styles.dcard}
          onClick={() => handleNavigation("/college-portal/exam-result")}
        >
          <FaBook className={styles.dicon} />
          <h3>Exam Results</h3>
        </div>

     
      </div>
      <div className={styles.cardGrid}>
      <div
          className={styles.dcard}
          onClick={() => handleNavigation("/college-portal/reports")}
        >
          <FaChartBar className={styles.dicon} />
          <h3>View Student Data</h3>
        </div>
        <div
          className={styles.dcard}
          onClick={() => handleNavigation("/college-portal/reports")}
          style={{visibility:"hidden"}}
        >
          <FaChartBar className={styles.dicon} />
          <h3>View Student Data</h3>
        </div>
        </div>
    </div>
  );
};

export default CollegePortal;
