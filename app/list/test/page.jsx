"use client";
import React, { useState, useCallback, useMemo } from "react";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";

const testData = [
  {
    id: "1",
    college: "College A",
    class: "Class 10",
    subject: "Mathematics",
    chapter: ["Algebra"],
    question: "Assessment 1",
  },
  {
    id: "2",
    college: "College B",
    class: "Class 11",
    subject: "Physics",
    chapter: ["Mechanics"],
    question: "Assessment 2",
  },
  // Add more test data here
];

const TestList = () => {
  const [filters, setFilters] = useState({
    college: "",
    class: "",
    subject: [],
    chapter: [],
  });

  const uniqueColleges = useMemo(
    () => Array.from(new Set(testData.map((test) => test.college))),
    []
  );

  const uniqueClasses = useMemo(
    () => Array.from(new Set(testData.map((test) => test.class))),
    []
  );

  const uniqueSubjects = useMemo(
    () => Array.from(new Set(testData.map((test) => test.subject))),
    []
  );

  const uniqueChapters = useMemo(() => {
    const chaptersSet = new Set();
    testData.forEach((test) =>
      test.chapter.forEach((ch) => chaptersSet.add(ch))
    );
    return Array.from(chaptersSet);
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  }, []);

  const filteredTests = testData.filter((test) => {
    return (
      (!filters.college || test.college === filters.college) &&
      (!filters.class || test.class === filters.class) &&
      (!filters.subject.length || filters.subject.includes(test.subject)) &&
      (!filters.chapter.length ||
        filters.chapter.some((ch) => test.chapter.includes(ch)))
    );
  });

  return (
    <div className="container">
      <div className="sectionHeader">List of Tests</div>
      <div className="inputContainer">
        <div className="formGroup">
          <label>Filter by College</label>
          <SearchableSingleSelect
            options={uniqueColleges.map((college) => ({
              id: college,
              name: college,
            }))}
            selectedValue={filters.college}
            onChange={(value) => handleFilterChange("college", value)}
            placeholder="Select college"
          />
        </div>
        <div className="formGroup">
          <label>Filter by Class</label>
          <SearchableSingleSelect
            options={uniqueClasses.map((cls) => ({
              id: cls,
              name: cls,
            }))}
            selectedValue={filters.class}
            onChange={(value) => handleFilterChange("class", value)}
            placeholder="Select class"
          />
        </div>
        <div className="formGroup">
          <label>Filter by Subject</label>
          <MultiSelectDropDown
            options={uniqueSubjects.map((subject) => ({
              id: subject,
              name: subject,
            }))}
            selectedValues={filters.subject}
            onChange={(value) => handleFilterChange("subject", value)}
            placeholder="Select subjects"
          />
        </div>
        <div className="formGroup">
          <label>Filter by Chapter</label>
          <MultiSelectDropDown
            options={uniqueChapters.map((chapter) => ({
              id: chapter,
              name: chapter,
            }))}
            selectedValues={filters.chapter}
            onChange={(value) => handleFilterChange("chapter", value)}
            placeholder="Select chapters"
          />
        </div>
      </div>

      <div className="questionList">
        <h3>Filtered Tests</h3>
        {filteredTests.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Test Title</th>
                <th>College</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Chapters</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id}>
                  <td>{test.question}</td>
                  <td>{test.college}</td>
                  <td>{test.class}</td>
                  <td>{test.subject}</td>
                  <td>{test.chapter.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data found.</p>
        )}
      </div>
    </div>
  );
};

export default TestList;
