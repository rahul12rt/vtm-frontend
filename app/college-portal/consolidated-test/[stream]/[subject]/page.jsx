"use client";
import React, { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer';
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
  const [activeClass, setActiveClass] = useState(1);
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
  
        // Construct API URL dynamically
        let apiUrl = `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=2&filters[student][college][user_name][$eq]=${collegeUsername}&populate[create_test][populate][subject][populate]=class&filters[create_test][exam_name][$eq]=${stream.toUpperCase()}&populate=student&filters[create_test][subject][class][id][$eq]=${activeClass}`;
  
        // Add subject filter only if capitalizedSubject is not "All"
        if (capitalizedSubject !== "All") {
          apiUrl += `&filters[create_test][subject][name][$eq]=${capitalizedSubject}`;
        }
  
        const response = await fetch(apiUrl);
  
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

  // Process data for All subjects
  const processResultsBySubject = () => {
    const subjectResults = {};

    results.forEach((curr) => {
      const test = curr.attributes.create_test?.data?.attributes;
      const subject = test?.subject?.data?.attributes?.name || "Unknown Subject";
      const obtained = curr.attributes.obtained || 0;
      const total = curr.attributes.total || 0;

      if (!test) return;

      const testName = test.name || "Unknown Test";
      const testDate = formatDate(test.date || "Unknown Date");

      if (!subjectResults[subject]) {
        subjectResults[subject] = {};
      }

      if (!subjectResults[subject][testName]) {
        subjectResults[subject][testName] = {
          name: testName,
          date: testDate,
          totalStudents: 0,
          totalObtained: 0,
          totalMarks: 0,
        };
      }

      subjectResults[subject][testName].totalStudents += 1;
      subjectResults[subject][testName].totalObtained += obtained;
      subjectResults[subject][testName].totalMarks += total;
    });

    return subjectResults;
  };

  // Process data for a single subject or aggregate
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

  // Render results by subject when "All" is selected
  const renderSubjectResults = () => {
    const subjectResults = processResultsBySubject();

    return Object.entries(subjectResults).map(([subjectName, tests]) => {
      // Custom Chart Component with Intersection Observer
      const AnimatedBarChart = () => {
        const { ref, inView } = useInView({
          triggerOnce: true,
          threshold: 0.1
        });

        const subjectTableData = Object.values(tests).map((test) => ({
          ...test,
          classAverage: test.totalStudents
            ? (test.totalObtained / test.totalStudents).toFixed(2)
            : "0.00",
        }));

        const subjectChartData = {
          labels: subjectTableData.map((test) => test.name),
          datasets: [
            {
              label: "Class Average",
              data: inView ? subjectTableData.map((test) => parseFloat(test.classAverage)) : subjectTableData.map(() => 0),
              backgroundColor: "#f9a825",
            },
          ],
        };

        const chartOptions = {
          responsive: true,
          animation: {
            duration: inView ? 1500 : 0, // Animation only when in view
          },
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: `${subjectName} - Class Average by Test`,
            },
          },
        };

        return (
          <div ref={ref} className={styles.chartContainer}>
            <Bar data={subjectChartData} options={chartOptions} />
          </div>
        );
      };

      return (
        <div key={subjectName} className="subject-section">
          <h2>{subjectName} Results</h2>
          
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
              {Object.values(tests).map((test, index) => {
                const classAverage = test.totalStudents
                  ? (test.totalObtained / test.totalStudents).toFixed(2)
                  : "0.00";

                return (
                  <tr key={index}>
                    <td>{test.name}</td>
                    <td>{test.date}</td>
                    <td>{test.totalStudents}</td>
                    <td>{test.totalObtained}</td>
                    <td>{test.totalMarks}</td>
                    <td>{classAverage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Animated Chart */}
          <AnimatedBarChart />
        </div>
      );
    });
  };

  // Similar modification for single subject chart
  const AnimatedSingleSubjectChart = ({ chartData, chartOptions }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1
    });

    const animatedChartData = {
      ...chartData,
      datasets: chartData.datasets.map(dataset => ({
        ...dataset,
        data: inView ? dataset.data : dataset.data.map(() => 0)
      }))
    };

    const animatedChartOptions = {
      ...chartOptions,
      animation: {
        duration: inView ? 1500 : 0, // Animation only when in view
      }
    };

    return (
      <div ref={ref} className={styles.chartContainer}>
        <Bar data={animatedChartData} options={animatedChartOptions} />
      </div>
    );
  };

  // Prepare chart data
  const chartData = {
    labels: tableData.map((test) => test.name),
    datasets: [
      {
        label: "Class Average",
        data: tableData.map((test) => parseFloat(test.classAverage)),
        backgroundColor: "#f9a825",
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

      {/* Conditional rendering based on subject */}
      {capitalizeFirstLetter(subject) === "All" ? (
        results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <h2 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Results Available</h2>
            <p style={{ color: '#6c757d' }}>
              We apologize, but there are currently no test results for {stream.toUpperCase()} - {activeClass === 1 ? 'PUC-1' : 'PUC-2'} at this time. 
              Please check back later or contact your academic administrator for more information.
            </p>
          </div>
        ) : (
          renderSubjectResults()
        )
      ) : (
        results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <h2 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Results Available</h2>
            <p style={{ color: '#6c757d' }}>
              We apologize, but there are currently no test results for {stream.toUpperCase()} - {activeClass === 1 ? 'PUC-1' : 'PUC-2'} at this time. 
              Please check back later or contact your academic administrator for more information.
            </p>
          </div>
        ) : (
          <>
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
                {tableData.map((test, index) => (
                  <tr key={index}>
                    <td>{test.name}</td>
                    <td>{test.date}</td>
                    <td>{test.totalStudents}</td>
                    <td>{test.totalObtained}</td>
                    <td>{test.totalMarks}</td>
                    <td>{test.classAverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Animated Chart */}
            <AnimatedSingleSubjectChart chartData={chartData} chartOptions={chartOptions} />
          </>
        )
      )}
    </div>
  );
};

export default Subject;