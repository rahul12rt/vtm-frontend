"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "../_utils/encryptionUtils";
import styles from "./TestList.module.css";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import Item from "antd/es/list/Item";
import { stream } from "xlsx";

const TestList = () => {
  const [studentData, setStudentData] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [completedTestIds, setCompletedTestIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("start"); // Default to "start"
  const router = useRouter();
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

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
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch student data");
          }

          const data = await response.json();

          setStudentData(data.data);

          await Promise.all(
            data.data.map(async (student) => {
              console.log(student)
              const classInfo = student.attributes.class.data;
              const academicYear = student.attributes.academic_year;
              const collegeId = student.attributes.college.data.id;
              const streams = student.attributes.stream.data.attributes.name

              console.log(streams)
              if (classInfo && academicYear) {
                await Promise.all([
                  fetchAssignedTests(classInfo.id, academicYear, collegeId, streams),
                  fetchCompletedTests(student.id),
                ]);
              }
            })
          );
        } catch (error) {
          console.log(error.message);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchAssignedTests = async (classId, academicYear, collegeId, streams) => {
      try {
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const testsEndpoint = `${strapiApiUrl}/api/assign-tests?filters[Assign][$eq]=true&filters[create_test][class][id][$eq]=${classId}&filters[create_test][academic_year][year][$eq]=${academicYear}&filters[create_test][exam_type][$eq]=2&filters[create_test][exam_name][$eq]=${streams}&filters[colleges][id][$eq]=${collegeId}&populate=create_test.class,create_test.academic_year,create_test.duration,create_test.subject,create_test.exam_type`;

        const bearerToken = Cookies.get("token");
        const response = await fetch(testsEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${bearerToken}`, // Set Bearer token in the header
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch assigned tests");
        }

        const testsData = await response.json();

        setAssignedTests(testsData.data);
      } catch (error) {
        console.log(error.message);
        setError(error.message);
      }
    };

    const fetchCompletedTests = async (studentId) => {
      try {
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const resultsEndpoint = `${strapiApiUrl}/api/results?filters[student][id][$eq]=${studentId}&populate=*`;

        const bearerToken = Cookies.get("token");

        const response = await fetch(resultsEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${bearerToken}`, // Set Bearer token in the header
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch completed tests");
        }

        const resultsData = await response.json();
        const completedIds = resultsData.data
          .filter(
            (result) =>
              result.attributes.create_test &&
              result.attributes.create_test.data !== null
          )
          .map((result) => result.attributes.create_test.data.id);
        setCompletedTestIds(completedIds);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchStudentData();
  }, []);

  const handleClick = (testId) => {
    const encryptedId = CryptoJS.AES.encrypt(
      testId.toString(),
      encryptionKey
    ).toString();
    Cookies.set("utmt_id", encryptedId, { expires: 1 });
    router.push(`/instructions`);
  };

  const filteredTests = assignedTests.filter((test) => {
    const testId = test.attributes.create_test.data.id;
    const isCompleted = completedTestIds.includes(testId);

    switch (filter) {
      case "completed":
        return isCompleted;
      case "start":
        return !isCompleted;
      default:
        return true; // "all" case
    }
  });

  if (loading)
    return (
      <div className="container">
        <div>Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <div>Error: {error}</div>
      </div>
    );

  return (
    <div className="container">
      <div className={styles.headerContainer}>
        <div className="sectionHeader" id="sectionFlex">
          <div>Test List</div>
          <select
            className={styles.filterDropdown}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Tests</option>
            <option value="start">Start</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredTests.length > 0 ? (
        <div className={styles.testList}>
          {filteredTests.map((test) => {
            const testAttributes = test.attributes.create_test.data.attributes;
            const testId = test.attributes.create_test.data.id;
            const isCompleted = completedTestIds.includes(testId);

            return (
              <div key={test.id} className={styles.testItem}>
                <div className={styles.testParentInfo}>
                  <h3>
                    {testAttributes.exam_name} - {testAttributes.name}
                  </h3>
                  <div className={styles.testInfo}>
                    <p>
                      Subject: {testAttributes.subject.data.attributes.name}
                    </p>
                    <p>Duration: {testAttributes.duration} minutes</p>
                    {/* <p>Exam Name: {testAttributes.exam_name}</p> */}
                  </div>
                </div>
                {isCompleted ? (
                  <p className={styles.completedBadge}>Completed</p>
                ) : (
                  <div className={styles.buttonWrapper}>
                    <button
                      className={isCompleted ? "editButton" : "submitButton"}
                      onClick={() => handleClick(testId)}
                      disabled={isCompleted}
                      style={{
                        cursor: isCompleted ? "not-allowed" : "pointer",
                      }}
                    >
                      {isCompleted ? "Completed" : "Start"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>No {filter === "all" ? "" : ""} tests found.</div>
      )}
    </div>
  );
};

export default TestList;
