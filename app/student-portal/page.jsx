"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./StudentPortal.module.css";
import { decrypt } from "../_utils/encryptionUtils";
import Cookies from "js-cookie";

const StudentPortal = () => {
  // const searchParams = useSearchParams();
  // const encryptedUsername = searchParams.get("utm");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const username = decrypt(encryptedUsername);
  const router = useRouter();

  useEffect(() => {
    const encryptedUser = Cookies.get("user");
    const username = decrypt(encryptedUser);
    const fetchStudentData = async () => {
      if (username) {
        try {
          setLoading(true);
          const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
          const userEndpoint = `${strapiApiUrl}/api/students?filters[user_name][$eq]=${username}&populate=*`;
          const bearerToken = Cookies.get("token");

          const response = await fetch(userEndpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${bearerToken}`, // Set Bearer token in the header
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch student data");
          }

          const data = await response.json();
          setStudentData(data?.data);
          const studentId = data?.data[0]?.id;
          if (studentId) {
            Cookies.set("utms_id", studentId, { expires: 1 });
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudentData();
  }, []);

  const handleTakeTestClick = () => {
    router.push(`/test-list`);
  };

  if (loading)
    return (
      <div className="container">
        <div>Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <div>Error: {error}</div>{" "}
      </div>
    );

  return (
    <div className="container">
      <div className="sectionHeader">Student Information</div>
      <div className={styles.studentTableContainer}>
        <table className={styles.studentTable}>
          <thead>
            <tr>
              <th style={{ width: "50%" }}>Name</th>
              <th style={{ width: "10%" }}>Roll Number</th>
              <th style={{ width: "10%" }}>Class</th>
              <th style={{ width: "10%" }}>Academic Year</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => {
              const { attributes } = student;
              const {
                name,
                roll_number,
                academic_year,
                class: classInfo,
              } = attributes;
              const className = classInfo?.data?.attributes?.name || "N/A";

              return (
                <tr key={student.id}>
                  <td>{name}</td>
                  <td>{roll_number}</td>
                  <td>{className}</td>
                  <td>{academic_year}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className={styles.buttonContainer} onClick={handleTakeTestClick}>
          <button className="submitButton">Take test</button>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
