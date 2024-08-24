"use client";
import React, { useState, useCallback, useMemo } from "react";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";

const questionsData = [
  {
    id: "1",
    college: "College A",
    class: "Class 10",
    subject: "Mathematics",
    chapter: ["Algebra"],
    topic: ["Linear Equations"],
    question: "Assessment 1",
    status: "Assign",
  },
  {
    id: "2",
    college: "College B",
    class: "Class 11",
    subject: "Physics",
    chapter: ["Mechanics"],
    topic: ["Newton's Laws"],
    question: "Assessment 2",
    status: "Assigned",
  },
  // Add more data if needed
];

const AssignTest = () => {
  const [filters, setFilters] = useState({
    college: "",
    class: "",
    subject: "",
    chapter: [],
    topic: [],
    testTitle: "",
    status: "", // Add filter for status
  });

  // Generate dropdown options dynamically from JSON data
  const uniqueColleges = useMemo(
    () => Array.from(new Set(questionsData.map((q) => q.college))),
    []
  );
  const uniqueClasses = useMemo(
    () => Array.from(new Set(questionsData.map((q) => q.class))),
    []
  );
  const uniqueSubjects = useMemo(
    () => Array.from(new Set(questionsData.map((q) => q.subject))),
    []
  );

  const uniqueChapters = useMemo(() => {
    const chaptersSet = new Set();
    questionsData
      .filter((q) => q.subject === filters.subject)
      .forEach((q) => q.chapter.forEach((ch) => chaptersSet.add(ch)));
    return Array.from(chaptersSet);
  }, [filters.subject]);

  const uniqueTopics = useMemo(() => {
    const topicsSet = new Set();
    questionsData
      .filter((q) =>
        filters.chapter.length
          ? filters.chapter.some((ch) => q.chapter.includes(ch))
          : true
      )
      .forEach((q) => q.topic.forEach((tp) => topicsSet.add(tp)));
    return Array.from(topicsSet);
  }, [filters.chapter]);

  const uniqueStatuses = useMemo(
    () => Array.from(new Set(questionsData.map((q) => q.status))),
    []
  );

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prevFilters) => {
      let newFilters = { ...prevFilters, [field]: value };

      if (field === "subject") {
        newFilters.chapter = [];
        newFilters.topic = [];
      } else if (field === "chapter") {
        newFilters.topic = [];
      }

      return newFilters;
    });
  }, []);

  const filteredQuestions = questionsData.filter((question) => {
    return (
      (!filters.college || question.college === filters.college) &&
      (!filters.class || question.class === filters.class) &&
      (!filters.subject || question.subject === filters.subject) &&
      (!filters.chapter.length ||
        filters.chapter.every((ch) => question.chapter.includes(ch))) &&
      (!filters.topic.length ||
        filters.topic.every((tp) => question.topic.includes(tp))) &&
      (!filters.testTitle ||
        question.question
          .toLowerCase()
          .includes(filters.testTitle.toLowerCase())) &&
      (!filters.status || question.status === filters.status) // Add filter for status
    );
  });

  const toggleStatus = (id) => {
    setFilters((prevFilters) => {
      const updatedQuestions = questionsData.map((q) =>
        q.id === id
          ? { ...q, status: q.status === "Assign" ? "Assigned" : "Assign" }
          : q
      );
      return { ...prevFilters, questionsData: updatedQuestions };
    });
  };

  return (
    <div className="container">
      <div className="sectionHeader">Assign Test</div>
      <div className="inputContainer">
        <div className="formGroup">
          <label>Filter by Test Title</label>
          <input
            type="text"
            value={filters.testTitle}
            onChange={(e) => handleFilterChange("testTitle", e.target.value)}
            placeholder="Enter test title"
            className="textInput"
          />
        </div>
        <div className="formGroup">
          <label>Filter by Class</label>
          <SearchableSingleSelect
            options={uniqueClasses.map((cls) => ({ id: cls, name: cls }))}
            selectedValue={filters.class}
            onChange={(value) => handleFilterChange("class", value)}
            placeholder="Select class"
          />
        </div>
        <div className="formGroup">
          <label>Filter by Status</label>
          <SearchableSingleSelect
            options={uniqueStatuses.map((status) => ({
              id: status,
              name: status,
            }))}
            selectedValue={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            placeholder="Select status"
          />
        </div>
      </div>

      <div className="questionList">
        <h3 style={{ marginBottom: 8 }}>Filtered Questions</h3>
        {filteredQuestions.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "70%" }}>Test Title</th>
                <th style={{ width: "10%" }}>Class</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "10%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question) => (
                <tr key={question.id}>
                  <td style={{ width: "70%" }}>{question.question}</td>
                  <td style={{ width: "10%" }}>{question.class}</td>
                  <td style={{ width: "10%" }}>{question.status}</td>
                  <td style={{ width: "10%" }}>
                    <button
                      style={{ width: "100%" }}
                      className={
                        question.status === "Assign"
                          ? "addButton"
                          : "editButton"
                      }
                      onClick={() => toggleStatus(question.id)}
                    >
                      {question.status === "Assign" ? "Assign" : "Assigned"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            {filters.college ||
            filters.class ||
            filters.subject ||
            filters.chapter.length ||
            filters.topic.length ||
            filters.testTitle ||
            filters.status
              ? "No data found."
              : "Filter to assign a test."}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssignTest;
