"use client";
import { decrypt } from "@/app/_utils/encryptionUtils";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import styles from "./results.module.css";

function Results() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [subjectClassFilter, setSubjectClassFilter] = useState("");
  const [examNameFilter, setExamNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeClass, setActiveClass] = useState(1); 
  const { stream, subject } = useParams();
  
  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const capitalizedSubject = subject ? capitalizeFirstLetter(subject) : "";
        const encryptedUser = Cookies.get("user");
        const collegeUsername = decrypt(encryptedUser);
        if (!collegeUsername) {
          console.error("No college username found in cookies");
          return;
        }

        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        console.log(collegeUsername);
        // Fetch results from API
        const resultsEndpoint = `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=2&filters[student][college][user_name][$eq]=${collegeUsername}&populate[create_test][populate][subject][populate]=class&populate[create_test][populate]=academic_year&filters[create_test][exam_name][$eq]=${stream.toUpperCase()}&filters[create_test][subject][name][$eq]=${capitalizedSubject}&populate=student&filters[create_test][subject][class][id][$eq]=${activeClass}`;
        const response = await fetch(resultsEndpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Remove duplicates based on unique attributes (e.g., exam name, date, subject)
        const uniqueResults = Array.from(
          new Map(
            data.data.map((item) => {
              const examName =
                item.attributes.create_test.data.attributes.exam_name;
              const date = item.attributes.create_test.data.attributes.date;
              const subject =
                item.attributes.create_test.data.attributes.subject.data
                  .attributes.name;

              // Create a unique key based on the combination of the exam name, date, and subject
              return [`${examName}-${date}-${subject}`, item];
            })
          ).values()
        );

        setResults(uniqueResults);
        setFilteredResults(uniqueResults); // Set initial filtered results
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [activeClass, stream, subject]);

  useEffect(() => {
    // Filter results based on selected filters
    const filtered = results.filter((result) => {
      const subject =
        result.attributes.create_test.data.attributes.subject.data.attributes
          .name;
      const className =
        result.attributes.create_test.data.attributes.subject.data.attributes
          .class.data.attributes.name;
      const examName = result.attributes.create_test.data.attributes.exam_name;
      const date = result.attributes.create_test.data.attributes.date;

      const subjectClassMatch = subjectClassFilter
        ? `${subject} (${className})` === subjectClassFilter
        : true;
      const examNameMatch = examNameFilter ? examName === examNameFilter : true;
      const dateMatch = dateFilter ? date === dateFilter : true;

      return subjectClassMatch && examNameMatch && dateMatch;
    });

    setFilteredResults(filtered);
  }, [subjectClassFilter, examNameFilter, dateFilter, results]);

  const handleViewResult = (id) => {
    router.push(`/college-portal/test-results/${id}`);
  };

  const handleSubjectClassFilterChange = (event) => {
    setSubjectClassFilter(event.target.value);
  };

  const handleExamNameFilterChange = (event) => {
    setExamNameFilter(event.target.value);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  // Create unique lists for dropdowns
  const uniqueSubjectsAndClasses = Array.from(
    new Set(
      results.map((result) => {
        const subject =
          result.attributes.create_test.data.attributes.subject.data.attributes
            .name;
        const className =
          result.attributes.create_test.data.attributes.subject.data.attributes
            .class.data.attributes.name;
        return `${subject} (${className})`;
      })
    )
  );

  const uniqueExamNames = Array.from(
    new Set(
      results.map(
        (result) => result.attributes.create_test.data.attributes.exam_name
      )
    )
  );

  const uniqueDates = Array.from(
    new Set(
      results.map(
        (result) => result.attributes.create_test.data.attributes.date
      )
    )
  );

  return (
    <div className="container">
      <div className="sectionHeader">Test Results</div>

      {/* Filter Dropdowns */}
      {/* <div className={styles.filterContainer}>
        <div>
          <select
            id="subjectClassFilter"
            value={subjectClassFilter}
            onChange={handleSubjectClassFilterChange}
          >
            <option value="">Filter by Subject (Class)</option>
            {uniqueSubjectsAndClasses.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            id="examNameFilter"
            value={examNameFilter}
            onChange={handleExamNameFilterChange}
          >
            <option value="">Filter by Exam Name</option>
            {uniqueExamNames.map((exam, index) => (
              <option key={index} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            id="dateFilter"
            value={dateFilter}
            onChange={handleDateFilterChange}
          >
            <option value="">Filter by Date</option>
            {uniqueDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div> */}


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

      {loading && <p>Loading results...</p>}
      {error && <p>Error: {error}</p>}

      {/* Display Results or No Results Found Message */}
      {filteredResults.length === 0 && !loading ? (
        <p>
          No tests found matching your filters. Please try different criteria.
        </p>
      ) : (
        filteredResults.map((result, id) => (
          <div className={styles.card} key={id}>
            {/* Left Section */}
            <div className={styles.leftSection}>
              <h2 className={styles.testName}>
                {result.attributes.create_test.data.attributes.name}
              </h2>
              <div>
                <p>
                  <strong>Subject:</strong>{" "}
                  {
                    result.attributes.create_test.data.attributes.subject.data
                      .attributes.name
                  }{" "}
                  (
                  {
                    result.attributes.create_test.data.attributes.subject.data
                      .attributes.class.data.attributes.name
                  }
                  )
                </p>
                |
                <p>
                  <strong>Exam Name:</strong>{" "}
                  {result.attributes.create_test.data.attributes.exam_name}
                </p>
                |
                <p>
                  <strong>Date:</strong>{" "}
                  {result.attributes.create_test.data.attributes.date}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className={styles.rightSection}>
              <button
                className="submitButton"
                onClick={() =>
                  handleViewResult(result.attributes.create_test.data.id)
                }
              >
                View Result
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Results;
