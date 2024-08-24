"use client";
import React, { useState, useCallback } from "react";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";
import questionsData from "../../_utils/QuestionsList.json";

const subjects = [
  { id: "1", name: "Mathematics" },
  { id: "2", name: "Physics" },
];

const chaptersData = {
  Mathematics: [
    { id: "1", name: "Algebra" },
    { id: "2", name: "Calculus" },
  ],
  Physics: [
    { id: "3", name: "Mechanics" },
    { id: "4", name: "Optics" },
  ],
};

const topicsData = {
  Algebra: [
    { id: "1", name: "Linear Equations" },
    { id: "2", name: "Quadratic Equations" },
  ],
  Calculus: [
    { id: "3", name: "Derivatives" },
    { id: "4", name: "Integrals" },
  ],
  Mechanics: [
    { id: "5", name: "Newton's Laws" },
    { id: "6", name: "Kinematics" },
  ],
  Optics: [
    { id: "7", name: "Refraction" },
    { id: "8", name: "Reflection" },
  ],
};

const classes = [
  { id: "1", name: "Class 10" },
  { id: "2", name: "Class 11" },
];

const academicYears = [
  { id: "1", name: "2024-2025" },
  { id: "2", name: "2023-2024" },
];

const CreateTest = () => {
  const [filters, setFilters] = useState({
    subject: "",
    chapter: [],
    topic: [],
    class: "",
    academicYear: "",
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [testTitle, setTestTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [showSelected, setShowSelected] = useState(false);

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
      (!filters.subject || question.subject === filters.subject) &&
      (!filters.chapter.length ||
        filters.chapter.some((ch) => question.chapter.includes(ch))) &&
      (!filters.topic.length ||
        filters.topic.some((tp) => question.topic.includes(tp))) &&
      (!filters.class || question.class === filters.class) &&
      (!filters.academicYear || question.academicYear === filters.academicYear)
    );
  });

  const availableChapters = chaptersData[filters.subject] || [];
  const availableTopics = filters.chapter.flatMap((ch) => topicsData[ch] || []);

  const handleAddQuestions = () => {
    setShowSelected(true);
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setDuration(value);
    }
  };

  return (
    <div className="container">
      <div className="sectionHeader">Create Test</div>
      <div className="inputContainer">
        {/* Filter by Subject */}
        <div className="formGroup">
          <label>Filter by Subject</label>
          <SearchableSingleSelect
            options={subjects}
            selectedValue={filters.subject}
            onChange={(value) => handleFilterChange("subject", value)}
            placeholder="Select subject"
          />
        </div>

        {/* Filter by Chapter */}
        <div className="formGroup">
          <label>Filter by Chapter</label>
          <MultiSelectDropDown
            options={availableChapters}
            selectedValues={filters.chapter}
            onChange={(value) => handleFilterChange("chapter", value)}
            placeholder="Select chapters"
          />
        </div>

        {/* Filter by Topic */}
        <div className="formGroup">
          <label>Filter by Topic</label>
          <MultiSelectDropDown
            options={availableTopics}
            selectedValues={filters.topic}
            onChange={(value) => handleFilterChange("topic", value)}
            placeholder="Select topics"
          />
        </div>

        {/* Filter by Class */}
        <div className="formGroup">
          <label>Filter by Class</label>
          <SearchableSingleSelect
            options={classes}
            selectedValue={filters.class}
            onChange={(value) => handleFilterChange("class", value)}
            placeholder="Select class"
          />
        </div>

        {/* Filter by Academic Year */}
        <div className="formGroup">
          <label>Filter by Academic Year</label>
          <SearchableSingleSelect
            options={academicYears}
            selectedValue={filters.academicYear}
            onChange={(value) => handleFilterChange("academicYear", value)}
            placeholder="Select academic year"
          />
        </div>
      </div>

      {/* Question Selection */}
      <div className="formGroup" style={{ marginBottom: 20 }}>
        <label>Select Questions</label>
        <div className="selectContainer">
          <MultiSelectDropDown
            options={filteredQuestions.map((q) => ({
              id: q.id,
              name: q.question,
            }))}
            selectedValues={selectedQuestions}
            onChange={setSelectedQuestions}
            placeholder="Select questions"
          />
        </div>
      </div>

      {/* Display Test Title and Duration */}
      {selectedQuestions.length > 0 && (
        <div className="inputContainer">
          <div className="formGroup">
            <label>Test Title</label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="Enter test title"
            />
          </div>
          <div className="formGroup">
            <label>Duration (minutes)</label>
            <input
              type="text"
              value={duration}
              onChange={handleDurationChange}
              placeholder="Enter duration"
            />
          </div>
        </div>
      )}

      {/* Display Selected Questions */}
      {selectedQuestions.length > 0 && (
        <div className="selectedQuestions">
          <h4>Selected Questions</h4>
          <ul>
            {selectedQuestions.map((questionId, id) => {
              const question = questionsData.find((q) => q.id === questionId);
              return question ? (
                <li key={question.id}>
                  <p>
                    {id + 1}. {question.question}
                  </p>
                  <div className="selectedOptions">
                    {question.options.map((option) => (
                      <div key={option} className="opt">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={option === question.correctOption}
                          readOnly
                        />
                        <label style={{ marginBottom: 0 }}>{option}</label>
                      </div>
                    ))}
                  </div>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}
      <button className="addButton">Create Test</button>
    </div>
  );
};

export default CreateTest;
