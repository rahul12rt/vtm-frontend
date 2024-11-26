"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import SearchableSingleSelect from "../../../_components/searchAbleDropDown";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import Cookies from "js-cookie";
import { decrypt } from "@/app/_utils/encryptionUtils";

// Register the required components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentReport = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const studentId = useParams();

  // Prepare subject options and subject data dynamically
  const prepareSubjectData = (results) => {
    const subjectData = {};

    // Assuming each result is for a different subject
    results.forEach((result, index) => {
      const subjectName = `Subject ${index + 1}`; // You might want to map this to actual subject names
      subjectData[subjectName] = [
        {
          name: "Total Marks",
          marks: result.attributes.obtained,
          rank: null,
          classAverage: result.attributes.total,
        },
      ];
    });

    return subjectData;
  };

  // Dynamic subject options
  const subjectOptions =
    students.length > 0
      ? Object.keys(prepareSubjectData(students)).map((subject) => ({
          id: subject,
          name: subject,
        }))
      : [];

  // Prepare data for the selected subject
  const selectedSubjectData =
    selectedSubject && students.length > 0
      ? prepareSubjectData(students)[selectedSubject] || []
      : [];

  const getChartData = (data) => ({
    labels: data.map((chapter) => chapter.name),
    datasets: [
      {
        label: "Obtained Marks",
        data: data.map((chapter) => chapter.marks),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Total Marks",
        data: data.map((chapter) => chapter.classAverage),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  });

  const getChartOptions = () => ({
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax:
          Math.max(...selectedSubjectData.map((d) => d.classAverage)) * 1.2,
      },
    },
  });

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (!studentId.id) {
        console.log("Student ID not yet available");
        setLoading(false);
        return;
      }

      try {
        const encryptedUser = Cookies.get("user");
        const collegeUsername = decrypt(encryptedUser || "");
        if (!collegeUsername) {
          console.error("No college username found in cookies");
          setLoading(false);
          return;
        }

        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const studentsEndpoint = `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=2&populate[student][populate]=class&populate[student][populate]=college&filters[student][id][$eq]=${studentId.id}&filters[student][college][user_name][$eq]=${collegeUsername}`;

        const response = await fetch(studentsEndpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        console.log(data);
        setStudents(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [studentId]);

  // Loading state handling
  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  // Error state handling
  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>;
  }

  // No data state
  if (students.length === 0) {
    return <div className={styles.noDataContainer}>No student data found</div>;
  }

  // Student details from the first result (assuming consistent data)
  console.log(students);
  const studentDetails = students[0].attributes.student.data.attributes;

  return (
    <div className="container">
      <div className={styles.heading}>
        <h2>{studentDetails.college.data.attributes.name}</h2>
        <p>
          STD: <span>{studentDetails.class.data.attributes.name}</span>
          Name of the Student: <span>{studentDetails.name}</span>
          Roll Number: <span>{studentDetails.roll_number}</span>
        </p>
      </div>

      <div className="formGroup">
        <label>Select Subject:</label>
        <SearchableSingleSelect
          options={subjectOptions}
          selectedValue={selectedSubject || ""}
          onChange={handleSubjectChange}
          placeholder="Select subject"
        />
      </div>

      {selectedSubject === "" ? (
        // Display data for all subjects
        subjectOptions.length > 0 ? (
          subjectOptions.map((subject) => {
            const data = prepareSubjectData(students)[subject.name];
            return (
              <div key={subject.id} className={styles.subjectSection}>
                <h3>Subject: {subject.name}</h3>
                <table className={styles.studentReportTable}>
                  <thead>
                    <tr>
                      <th>Marks Details</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((detail) => (
                      <tr key={detail.name}>
                        <td>{detail.name}</td>
                        <td>
                          {detail.marks} / {detail.classAverage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.studentReportChart}>
                  <h4>{subject.name} Marks Distribution</h4>
                  <Bar data={getChartData(data)} options={getChartOptions()} />
                </div>
              </div>
            );
          })
        ) : (
          <p>No subjects available.</p>
        )
      ) : selectedSubjectData.length > 0 ? (
        <>
          <h3>{selectedSubject}</h3>
          <table className={styles.studentReportTable}>
            <thead>
              <tr>
                <th>Marks Details</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {selectedSubjectData.map((detail) => (
                <tr key={detail.name}>
                  <td>{detail.name}</td>
                  <td>
                    {detail.marks} / {detail.classAverage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.studentReportChart}>
            <h4>{selectedSubject} Marks Distribution</h4>
            <Bar
              data={getChartData(selectedSubjectData)}
              options={getChartOptions()}
            />
          </div>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default StudentReport;
