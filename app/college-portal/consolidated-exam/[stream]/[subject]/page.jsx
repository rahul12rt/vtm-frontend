"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decrypt } from "@/app/_utils/encryptionUtils";
import { useParams } from "next/navigation";
import styles from "./pages.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Subject = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeClass, setActiveClass] = useState(1); // Initialize with PUC-1
  const { stream, subject } = useParams();

  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = new Date(dateString).toLocaleDateString("en-GB", options);
    return formattedDate.replace(/ /g, "-");
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const capitalizedSubject = subject ? capitalizeFirstLetter(subject) : "";
        const encryptedUser = Cookies.get("user");
        if (!encryptedUser) throw new Error("User is not authenticated");
        const collegeUsername = decrypt(encryptedUser);
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

        const response = await fetch(
          `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=3&filters[student][college][user_name][$eq]=${collegeUsername}&populate[create_test][populate][subject][populate]=class&filters[create_test][exam_name][$eq]=${stream.toUpperCase()}&filters[create_test][subject][name][$eq]=${capitalizedSubject}&populate=student&filters[create_test][subject][class][id][$eq]=${activeClass}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();
        setResults(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [stream, subject, activeClass]);

  if (loading) return <h1 className="container">Loading results...</h1>;
  if (error) return <h1 className="container">Error: {error}</h1>;

  // Process data
  const aggregatedResults = results.reduce((acc, curr) => {
    const test = curr.attributes.create_test?.data?.attributes;
    const obtained = curr.attributes.obtained || 0;
    const total = curr.attributes.total || 0;

    if (!test) return acc;

    const testName = test.name || "Unknown Test";
    const testDate = formatDate(test.date || "Unknown Date");

    if (!acc[testName]) {
      acc[testName] = {
        name: testName,
        date: testDate,
        totalStudents: 0,
        totalObtained: 0,
        totalMarks: 0,
      };
    }

    acc[testName].totalStudents += 1;
    acc[testName].totalObtained += obtained;
    acc[testName].totalMarks += total;

    return acc;
  }, {});

  const tableData = Object.values(aggregatedResults).map((test) => ({
    ...test,
    classAverage: test.totalStudents
      ? (test.totalObtained / test.totalStudents).toFixed(2)
      : "0.00",
  }));

  // Prepare chart data
  // Prepare chart data for Test Name and Class Average only
const chartData = {
    labels: tableData.map((test) => test.name), // Test names
    datasets: [
      {
        label: "Class Average",
        data: tableData.map((test) => parseFloat(test.classAverage)), // Class averages
        backgroundColor: "#f9a825", // Light teal color
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Class Average by Test",
      },
    },
  };
  

  return (
    <div className="container">
            
        <div className="sectionHeader">VES - Knowledge Hub</div>
 
      <h1>
        {stream.toUpperCase()} Results - {capitalizeFirstLetter(subject)}
      </h1>

      {/* Tabs for PUC-1 and PUC-2 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeClass === 1 ? styles.active : ""}`}
          onClick={() => setActiveClass(1)}
        >
          PUC-1
        </button>
        <button
          className={`${styles.tabButton} ${activeClass === 2 ? styles.active : ""}`}
          onClick={() => setActiveClass(2)}
        >
          PUC-2
        </button>
      </div>



      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Date</th>
            <th>Total Students</th>
            <th>Obtained Marks</th>
            <th>Total Marks</th>
            <th>Class Average</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 ? (
            tableData.map((test, index) => (
              <tr key={index}>
                <td>{test.name}</td>
                <td>{test.date}</td>
                <td>{test.totalStudents}</td>
                <td>{test.totalObtained}</td>
                <td>{test.totalMarks}</td>
                <td>{test.classAverage}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No results available</td>
            </tr>
          )}
        </tbody>
      </table>
            {/* Chart */}
    <div className={styles.chartContainer}>
     <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Subject;
