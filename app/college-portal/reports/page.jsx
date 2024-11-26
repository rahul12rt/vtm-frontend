"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import styles from "./page.module.css";
import { decrypt } from "../../_utils/encryptionUtils";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(2);
  const [selectedStream, setSelectedStream] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const encryptedUser = Cookies.get("user");
        const collegeUsername = decrypt(encryptedUser || "");
        if (!collegeUsername) {
          console.error("No college username found in cookies");
          return;
        }

        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const studentsEndpoint = `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=2&filters[student][college][user_name][$eq]=${collegeUsername}&populate[student][populate]=class&filters[student][class][id][$eq]=${selectedClass}&filters[student][stream][id][$eq]=${selectedStream}`;

        const response = await fetch(studentsEndpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Remove duplicates based on student ID
        const uniqueStudents = Array.from(
          new Map(
            data.data.map((item) => [item.attributes.student.data.id, item])
          ).values()
        );

        setStudents(uniqueStudents);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedStream]);

  // Handler for class selection
  const handleClassFilter = (classId) => {
    setSelectedClass(classId);
  };

  // Handler for stream selection
  const handleStreamFilter = (streamId) => {
    setSelectedStream(streamId);
  };

  // Handler for navigating to student's detailed report
  const handleViewReports = (studentId) => {
    router.push(`/college-portal/reports/${studentId}`);
  };

  // Render loading state
  if (loading) {
    return <div className={styles.loading}>Loading students...</div>;
  }

  // Render error state
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  console.log(students.slice(0, 10));
  return (
    <div className="container">
      {/* Class Filter Buttons */}
      <div className={styles.streamFilterContainer}>
        <button
          onClick={() => handleClassFilter(1)}
          className={`${styles.streamFilterBtn} ${
            selectedClass === 1 ? styles.activeFilter : ""
          }`}
        >
          PUC-I
        </button>
        <button
          onClick={() => handleClassFilter(2)}
          className={`${styles.streamFilterBtn} ${
            selectedClass === 2 ? styles.activeFilter : ""
          }`}
        >
          PUC-II
        </button>
      </div>

      {/* Stream Filter Buttons */}
      <div className={styles.streamFilterContainer}>
        <button
          onClick={() => handleStreamFilter(1)}
          className={`${styles.streamFilterBtn} ${
            selectedStream === 1 ? styles.activeFilter : ""
          }`}
        >
          CET
        </button>
        <button
          onClick={() => handleStreamFilter(2)}
          className={`${styles.streamFilterBtn} ${
            selectedStream === 2 ? styles.activeFilter : ""
          }`}
        >
          JEE
        </button>
        <button
          onClick={() => handleStreamFilter(3)}
          className={`${styles.streamFilterBtn} ${
            selectedStream === 3 ? styles.activeFilter : ""
          }`}
        >
          NEET
        </button>
      </div>

      <div className="sectionHeader">Students</div>
      {students.length === 0 ? (
        <p className={styles.noStudents}>No students found.</p>
      ) : (
        <div className={styles.studentGrid}>
          {students.map((student) => {
            const studentData = student.attributes.student.data.attributes;
            return (
              <div key={student.id} className={styles.studentCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.studentName}>{studentData.name}</h2>
                  <span className={styles.rollNumber}>
                    Roll: {studentData.roll_number}
                  </span>
                </div>
                <div className={styles.cardFooter}>
                  <button
                    onClick={() =>
                      handleViewReports(student.attributes.student.data.id)
                    }
                    className="submitButton"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Students;
