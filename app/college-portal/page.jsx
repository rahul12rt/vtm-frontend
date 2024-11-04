"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "../_utils/encryptionUtils";
import Cookies from "js-cookie";
import styles from "./CollegePortal.module.css";

const CollegePortal = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const encryptedUser = Cookies.get("user");
    const username = decrypt(encryptedUser);

    console.log(username);

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
          console.log(response);
          if (!response.ok) {
            throw new Error("Failed to fetch student data");
          }

          const data = await response.json();
          setStudentData(data?.data);
          //   const studentId = data?.data[0]?.id;
          //   if (studentId) {
          //     Cookies.set("utms_id", studentId, { expires: 1 });
          //   }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudentData();
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="container">
      <div className="sectionHeader">College Information</div>
      {/* Navigation Cards */}
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
        <div
          className={styles.card}
          onClick={() => handleNavigation("/college-portal/test-results")}
        >
          Student Wise
        </div>
      </div>
    </div>
  );
};

export default CollegePortal;
