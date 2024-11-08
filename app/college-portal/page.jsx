"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "../_utils/encryptionUtils";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import styles from "./CollegePortal.module.css";
import { FaFileUpload } from "react-icons/fa";
import CollegePortalExcelUpload from "../_components/uploadFile";

const CollegePortal = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const encryptedUser = Cookies.get("user");
    const username = decrypt(encryptedUser);

    const fetchStudentData = async () => {
      if (username) {
        try {
          setLoading(true);
          const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
          const userEndpoint = `${strapiApiUrl}/api/colleges?filters[user_name][$eq]=${username}&populate=*`;
          const bearerToken = Cookies.get("token");

          const response = await fetch(userEndpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch student data");
          }

          const data = await response.json();
          setStudentData(data?.data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudentData();
  }, []);

  const handleNavigation = useCallback(
    (path) => {
      router.push(path);
    },
    [router]
  );

  return (
    <div className="container">
      <div className="sectionHeader">College Information</div>
      <div className={styles.cardContainer}>
        <div
          className={styles.card}
          onClick={() => handleNavigation("/college-portal/test-results")}
        >
          Test Results
        </div>
        <div
          className={styles.card}
          onClick={() => handleNavigation("/college-portal/exam-results")}
        >
          Exam Results
        </div>
      </div>
      <h1>Reports</h1>
      <div className={styles.cardContainer}>
        {/* <div
          className={styles.card}
          onClick={() => handleNavigation("/college-portal/test-results")}
        >
          Student Wise
        </div> */}
        <CollegePortalExcelUpload />
      </div>
    </div>
  );
};

export default CollegePortal;
