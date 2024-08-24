"use client";
import React, { useState } from "react";
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
import SearchableSingleSelect from "../../_components/searchAbleDropDown";
import { useParams } from "next/navigation";
import styles from "./page.module.css";

// Register the required components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const studentData = {
  Physics: [
    {
      name: "Units and Dimensions",
      marks: 40,
      rank: 22,
      classAverage: 48.97,
    },
    {
      name: "Vectors & Kinematics",
      marks: 60,
      rank: 4,
      classAverage: 41.88,
    },
    {
      name: "Laws of Motion",
      marks: 55,
      rank: 3,
      classAverage: 58,
    },
  ],
  Maths: [
    {
      name: "Algebra",
      marks: 70,
      rank: 5,
      classAverage: 65.5,
    },
    {
      name: "Calculus",
      marks: 80,
      rank: 2,
      classAverage: 72.3,
    },
    {
      name: "Geometry",
      marks: 60,
      rank: 10,
      classAverage: 55.4,
    },
  ],
  Chemistry: [
    {
      name: "Chemical Bonding",
      marks: 75,
      rank: 8,
      classAverage: 70.2,
    },
    {
      name: "Thermodynamics",
      marks: 65,
      rank: 12,
      classAverage: 66.5,
    },
    {
      name: "Equilibrium",
      marks: 85,
      rank: 1,
      classAverage: 80.0,
    },
  ],
};

const StudentReport = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const { studentName } = useParams(); // Get student name from URL params

  // Ensure subjects is an object and get subject options
  const subjectOptions =
    studentData && typeof studentData === "object"
      ? Object.keys(studentData).map((subject) => ({
          id: subject,
          name: subject,
        }))
      : [];

  // Prepare data for the selected subject
  const selectedSubjectData = selectedSubject
    ? studentData[selectedSubject] || []
    : [];

  const getChartData = (data) => ({
    labels: data.map((chapter) => chapter.name),
    datasets: [
      {
        label: "Marks",
        data: data.map((chapter) => chapter.marks),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Class Average",
        data: data.map((chapter) => chapter.classAverage),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  });

  const getChartOptions = () => ({
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 120, // Set maximum value for the y-axis
      },
    },
  });

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  return (
    <div className="container">
      <div className={styles.heading}>
        <h2>SADVIDYA COMPOSITE PU COLLEGE, MYSORE COMPETITIVE EXAM REPORT</h2>
        <p>
          STD: <span>PUC-1</span> Section: <span>JEE</span> Name of the Student:
          <span> {studentName || "[Student Name]"}</span>
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
        Object.keys(studentData).length > 0 ? (
          Object.keys(studentData).map((subject) => {
            const data = studentData[subject];
            return (
              <div key={subject} className={styles.subjectSection}>
                <h3>Subject: {subject}</h3>
                <table className={styles.studentReportTable}>
                  <thead>
                    <tr>
                      <th>SL NO</th>
                      <th>NAME OF CHAPTER</th>
                      <th>MARKS</th>
                      <th>RANK</th>
                      <th>CLASS AVERAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((chapter, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{chapter.name}</td>
                        <td>{chapter.marks}</td>
                        <td>{chapter.rank}</td>
                        <td>{chapter.classAverage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.studentReportChart}>
                  <h4>{subject} Marks Distribution</h4>
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
                <th>SL NO</th>
                <th>NAME OF CHAPTER</th>
                <th>MARKS</th>
                <th>RANK</th>
                <th>CLASS AVERAGE</th>
              </tr>
            </thead>
            <tbody>
              {selectedSubjectData.map((chapter, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{chapter.name}</td>
                  <td>{chapter.marks}</td>
                  <td>{chapter.rank}</td>
                  <td>{chapter.classAverage}</td>
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
