"use client";
import React, { useState } from "react";
import SearchableSingleSelect from "../_components/searchAbleDropDown";
import jsonData from "../_utils/testList.json";
import Pagination from "../_components/pagination";
import styles from "./page.module.css";

const TestResults = () => {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTestTitle, setSelectedTestTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination states
  const [currentPageMap, setCurrentPageMap] = useState({});
  const [itemsPerPageMap, setItemsPerPageMap] = useState({});

  const handlePageChange = (testIndex, page) => {
    setCurrentPageMap((prev) => ({ ...prev, [testIndex]: page }));
  };

  const handleItemsPerPageChange = (testIndex, itemsPerPage) => {
    setItemsPerPageMap((prev) => ({ ...prev, [testIndex]: itemsPerPage }));
    setCurrentPageMap((prev) => ({ ...prev, [testIndex]: 1 }));
  };

  // Extract college options from JSON data
  const collegeOptions =
    jsonData.colleges?.map((college, index) => ({
      id: `${index}`,
      name: college.collegeName,
    })) || [];

  // Extract class options based on selected college
  const classOptions = Array.from(
    new Set(
      jsonData.colleges
        .find((college) => college.collegeName === selectedCollege)
        ?.tests.map((test) => test.class)
    )
  ).map((className, index) => ({
    id: `${index}`,
    name: className,
  }));

  // Extract subject options based on selected filters
  const subjectOptions = Array.from(
    new Set(
      jsonData.colleges
        .find((college) => college.collegeName === selectedCollege)
        ?.tests.filter((test) => test.class === selectedClass)
        .map((test) => test.subject)
    )
  ).map((subject, index) => ({
    id: `${index}`,
    name: subject,
  }));

  // Extract test title options based on selected filters
  const testTitleOptions = Array.from(
    new Set(
      jsonData.colleges
        .find((college) => college.collegeName === selectedCollege)
        ?.tests.filter(
          (test) =>
            test.class === selectedClass && test.subject === selectedSubject
        )
        .map((test) => test.testTitle)
    )
  ).map((testTitle, index) => ({
    id: `${index}`,
    name: testTitle,
  }));

  // Extract date options based on selected filters
  const dateOptions = Array.from(
    new Set(
      jsonData.colleges
        .find((college) => college.collegeName === selectedCollege)
        ?.tests.filter(
          (test) =>
            test.class === selectedClass &&
            test.subject === selectedSubject &&
            test.testTitle === selectedTestTitle
        )
        .map((test) => test.date)
    )
  ).map((date, index) => ({
    id: `${index}`,
    name: date,
  }));

  // Filter and paginate results
  const filteredTests = jsonData.colleges
    .filter(
      (college) => !selectedCollege || college.collegeName === selectedCollege
    )
    .flatMap((college) =>
      college.tests
        .filter(
          (test) =>
            (!selectedClass || test.class === selectedClass) &&
            (!selectedSubject || test.subject === selectedSubject) &&
            (!selectedTestTitle || test.testTitle === selectedTestTitle) &&
            (!selectedDate || test.date === selectedDate)
        )
        .map((test) => ({
          ...test,
          collegeName: college.collegeName, // Include the college name in the test data
        }))
    );

  return (
    <div className="container">
      <h2 className="sectionHeader">Filter Test Results</h2>
      <div className="inputContainer">
        <SearchableSingleSelect
          options={collegeOptions}
          selectedValue={selectedCollege}
          onChange={(value) => setSelectedCollege(value)}
          placeholder="Select College"
        />
      </div>
      <div className="inputContainer">
        <SearchableSingleSelect
          options={classOptions}
          selectedValue={selectedClass}
          onChange={(value) => setSelectedClass(value)}
          placeholder="Select Class"
        />
        <SearchableSingleSelect
          options={subjectOptions}
          selectedValue={selectedSubject}
          onChange={(value) => setSelectedSubject(value)}
          placeholder="Select Subject"
        />
        <SearchableSingleSelect
          options={testTitleOptions}
          selectedValue={selectedTestTitle}
          onChange={(value) => setSelectedTestTitle(value)}
          placeholder="Select Test Topic"
        />
        <SearchableSingleSelect
          options={dateOptions}
          selectedValue={selectedDate}
          onChange={(value) => setSelectedDate(value)}
          placeholder="Select Date"
        />
      </div>

      {/* Display test results for each college */}
      {filteredTests.map((test, testIndex) => {
        const currentPage = currentPageMap[testIndex] || 1;
        const itemsPerPage = itemsPerPageMap[testIndex] || 10;

        const totalItems = test.students.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginatedStudents = test.students.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

        return (
          <div key={testIndex} className={styles.testSection}>
            {/* Dynamic Header for each test */}
            <div className={styles.headerSection}>
              <div className={styles.sectionHeader}>
                College Name - {test.collegeName}{" "}
                {/* Now displaying the college name */}
              </div>
            </div>

            {/* Display test results */}
            <div>
              <div className={styles.tableContainer}>
                <div className={styles.classDetails}>
                  {test.class} Section {test.academicYear}
                </div>
                <div className={styles.testDetails}>
                  <div className={styles.testTitle}>
                    {test.class} {test.subject} - {test.testTitle}
                  </div>
                  <div className={styles.testDate}>
                    <span>Date:</span> {test.date}
                  </div>
                </div>
              </div>
              <h3>
                Test Results <span>({test.students.length})</span>
              </h3>

              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Obtain Marks</th>
                    <th>Total Marks</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student, studentIndex) => (
                      <tr key={studentIndex}>
                        <td>{student.rollNo || "N/A"}</td>
                        <td>{student.name || "N/A"}</td>
                        <td>{student.marks.obtained || "N/A"}</td>
                        <td>{student.marks.total || "N/A"}</td>
                        <td>{student.marks.rank || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination for each test */}
              {totalItems > 9 && (
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={(page) => handlePageChange(testIndex, page)}
                  onItemsPerPageChange={(items) =>
                    handleItemsPerPageChange(testIndex, items)
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TestResults;
