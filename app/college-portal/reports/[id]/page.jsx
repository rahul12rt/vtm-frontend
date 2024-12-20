"use client"
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
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
import { decrypt } from "@/app/_utils/encryptionUtils";
import styles from "./page.module.css";
import { useParams } from "next/navigation";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StudentReport() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Test"); // Default to Test
  const studentId = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      if (!studentId.id) {
        setLoading(false);
        return;
      }

      try {
        const encryptedUser = Cookies.get("user");
        const username = decrypt(encryptedUser);

        if (!username) {
          throw new Error("No username found in cookies");
        }

        const examType = activeTab === "Test" ? 2 : 3; // Change exam type based on active tab
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const resultsEndpoint = `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=${examType}&filters[student][id][$eq]=${studentId.id}&filters[student][college][user_name][$eq]=${username}&populate[create_test][populate]=class,academic_year,subject,topics,exam_name,exam_type,college&populate=student`;

        const response = await fetch(resultsEndpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setResults(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId, activeTab]); // Added activeTab as dependency

  // Rest of the existing functions...
  const groupedResults = results.reduce((acc, result) => {
    const subject =
      result.attributes.create_test.data.attributes.subject.data.attributes
        .name;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(result);
    return acc;
  }, {});

  const filteredGroupedResults = Object.fromEntries(
    Object.entries(groupedResults).filter(([subject]) =>
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const prepareChartData = (result) => {
    const testInfo = result.attributes;
    const createTest = result.attributes.create_test.data.attributes;

    return {
      labels: ["Obtained Marks", "Total Marks"],
      datasets: [
        {
          label: createTest.name,
          data: [testInfo.obtained, testInfo.total],
          backgroundColor: [
            getMarkColor(testInfo.obtained, testInfo.total),
            "rgba(54, 162, 235, 0.6)",
          ],
          borderColor: [
            getMarkColor(testInfo.obtained, testInfo.total, true),
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getMarkColor = (obtained, total, isBorder = false) => {
    const percentage = (obtained / total) * 100;
    const baseColors = {
      success: isBorder ? "rgba(75, 192, 192, 1)" : "rgba(75, 192, 192, 0.6)",
      warning: isBorder ? "rgba(255, 206, 86, 1)" : "rgba(255, 206, 86, 0.6)",
      danger: isBorder ? "rgba(255, 99, 132, 1)" : "rgba(255, 99, 132, 0.6)",
    };

    if (percentage >= 75) return baseColors.success;
    if (percentage >= 50) return baseColors.warning;
    return baseColors.danger;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Test Performance",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Marks",
        },
      },
    },
  };

  if (loading) return <div className={styles.loading}>Loading results...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className="container">
      {/* Tabs */}
      <div className={styles.streamFilterContainer}>
        <button
          className={activeTab === "Test" ? styles.activeFilter : styles.streamFilterBtn}
          onClick={() => setActiveTab("Test")}
        >
          Test
        </button>
        <button
          className={activeTab === "Exam" ? styles.activeFilter : styles.streamFilterBtn}
          onClick={() => setActiveTab("Exam")}
        >
          Exam
        </button>
      </div>

      {/* Search Input */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {results.length === 0 ? (
        <div className={styles.noResults}>No test results found for {activeTab}.</div>
      ) : (
        <>
          <div className="sectionHeader">Test Results - {activeTab}</div>

          {Object.entries(filteredGroupedResults).map(
            ([subject, subjectResults]) => (
              <div key={subject} className={styles.subjectSection}>
                <h2 className={styles.subjectTitle}>{subject}</h2>

                {/* Table for subject results */}
                <table className={styles.resultsTable}>
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Date</th>
                      <th>Obtained Marks</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectResults.map((result) => {
                      const testInfo = result.attributes;
                      const createTest =
                        result.attributes.create_test.data.attributes;
                      const percentage = (
                        (testInfo.obtained / testInfo.total) *
                        100
                      ).toFixed(2);

                      return (
                        <tr key={result.id}>
                          <td>{createTest.name}</td>
                          <td>{createTest.date}</td>
                          <td>{testInfo.obtained}</td>
                          <td>{testInfo.total}</td>
                          <td>
                            <span
                              className={
                                percentage >= 75
                                  ? styles.bgSuccess
                                  : percentage >= 50
                                  ? styles.bgWarning
                                  : styles.bgDanger
                              }
                            >
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Bar Charts for Individual Tests */}
                <div className={styles.testChartsContainer}>
                  {subjectResults.map((result) => (
                    <div key={result.id} className={styles.singleTestChart}>
                      <Bar
                        data={prepareChartData(result)}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: result.attributes.create_test.data.attributes
                                .name,
                            },
                          },
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default StudentReport;