"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import toast, { Toaster } from "react-hot-toast";

const CreateTest = () => {
  const [filters, setFilters] = useState({
    subject: null,
    chapter: [],
    topic: [],
    class: null,
    stream: null,
    academicYear: null,
    question: "",
    level: null,
    type: null,
  });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showTestInputs, setShowTestInputs] = useState(false); // State to track whether to show inputs
  const [testTitle, setTestTitle] = useState(""); // State to track test title
  const [testDuration, setTestDuration] = useState(""); // State to track test duration
  const [testDate, setTestDate] = useState("");
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("");
  const [data, setData] = useState({
    subjects: [],
    chapters: [],
    topics: [],
    classes: [],
    streams: [],
    years: [],
    levels: [],
    types: [],
  });
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    years: false,
    streams: false,
  });

  const [errors, setErrors] = useState({
    title: "",
    duration: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDropdownLoading((prevState) => ({
        ...prevState,
        years: true,
        streams: true,
      }));

      try {
        const buildQueryString = () => {
          const filtersArray = [];

          if (filters.subject) {
            filtersArray.push(`filters[subject][id][$eq]=${filters.subject}`);
          }
          if (filters.chapter.length) {
            filtersArray.push(
              ...filters.chapter.map((ch) => `filters[chapters][id][$eq]=${ch}`)
            );
          }
          if (filters.topic.length) {
            filtersArray.push(
              ...filters.topic.map((tp) => `filters[topics][id][$eq]=${tp}`)
            );
          }
          if (filters.stream) {
            filtersArray.push(`filters[stream][id][$eq]=${filters.stream}`);
          }
          if (filters.academicYear) {
            filtersArray.push(
              `filters[academic_year][id][$eq]=${filters.academicYear}`
            );
          }
          if (filters.question) {
            filtersArray.push(
              `filters[question][$containsi]=${filters.question}`
            );
          }
          if (filters.level) {
            filtersArray.push(`filters[level][id][$eq]=${filters.level}`);
          }

          return filtersArray.join("&");
        };

        const queryString = buildQueryString();

        const [
          typeResponse,
          subjectsResponse,
          chaptersResponse,
          yearsResponse,
          questionsResponse,
          levelsResponse,
          streamsResponse,
        ] = await Promise.all([
          fetch("/api/type"),
          fetch("/api/subjects?populate=*"), // Modified to include class data
          fetch("/api/chapter"),
          fetch("/api/academic"),
          fetch(`/api/filter-questions${queryString ? `?${queryString}` : ""}`),
          fetch("/api/levels"),
          fetch("/api/streams"),
        ]);

        const [
          subjectsResult,
          chaptersResult,
          yearsResult,
          questionsResult,
          levelsResult,
          streamsResult,
        ] = await Promise.all([
          subjectsResponse.json(),
          chaptersResponse.json(),
          yearsResponse.json(),
          questionsResponse.json(),
          levelsResponse.json(),
          streamsResponse.json(),
        ]);

        const typeResult = await typeResponse.json();

        const typesData = typeResult.data.map((type) => ({
          id: type.id,
          name: type.attributes.type,
        }));
        setData((prevState) => ({ ...prevState, types: typesData }));

        const streamsData = streamsResult.data.map((stream) => ({
          id: stream.id,
          name: stream.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, streams: streamsData }));

        // Modified to include class information in subjects
        const subjectsData = subjectsResult.data.map((subject) => ({
          id: subject.id,
          name: `${subject.attributes.name} (${subject.attributes.class.data.attributes.name})`,
          className: subject.attributes.class.data.attributes.name,
          classId: subject.attributes.class.data.id,
          rawName: subject.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, subjects: subjectsData }));

        const yearsData = yearsResult.data.map((year) => ({
          id: year.id,
          name: year.attributes.year,
        }));
        setData((prevState) => ({ ...prevState, years: yearsData }));

        const chaptersData = chaptersResult.data.map((chapter) => ({
          id: chapter.id,
          name: chapter.attributes.name,
          subjectId: chapter.attributes.subject.data.id,
          subjectName: chapter.attributes.subject.data.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, chapters: chaptersData }));

        const levelsData = levelsResult.data.map((level) => ({
          id: level.id,
          name: level.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, levels: levelsData }));

        const topicQueryString = chaptersData
          .map((id) => `filters[chapter][id][$eq]=${id}`)
          .join("&");
        const topicsResponse = await fetch(
          `/api/topics?populate[chapter]=*&${topicQueryString}`
        );

        const topicsResult = await topicsResponse.json();
        const topicsData = topicsResult.data.map((topic) => ({
          id: topic.id,
          name: topic.attributes.name,
          chapterId: topic.attributes.chapter.data.id,
        }));
        setData((prevState) => ({ ...prevState, topics: topicsData }));

        // Map the questions to the required format
        const mappedQuestions = questionsResult.data.map((item) => ({
          id: item.id,
          question: item.attributes.question,
          options: [
            item.attributes.answer_1,
            item.attributes.answer_2,
            item.attributes.answer_3,
            item.attributes.answer_4,
            item.attributes.answer_5, // Add answer_5 to the array
          ].filter((answer) => answer !== null),
          correctOption: item.attributes.correct_answer,
          subject: item.attributes.subject.data.attributes.name,
          chapter: item.attributes.chapters.data
            .map((chap) => chap.attributes.name)
            .join(", "),
          topic: item.attributes.topics.data
            .map((top) => top.attributes.name)
            .join(", "),
          class:
            item.attributes.subject.data.attributes.class.data.attributes.name,
          academicYear: item.attributes.academic_year.data.attributes.year,
        }));
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
        setDropdownLoading((prevState) => ({
          ...prevState,
          years: false,
        }));
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "subject") {
      const selectedSubject = data.subjects.find((s) => s.id === Number(value));
      if (selectedSubject) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          [filterName]: value,
          class: selectedSubject.classId, // Automatically set the class based on selected subject
        }));
      }
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    }
  };

  const handleQuestionsChange = (selected) => {
    setSelectedQuestions(selected);
    if (selected.length > 0) {
      setShowTestInputs(true); // Show inputs if there are selected questions
    } else {
      setShowTestInputs(false); // Hide inputs if no questions are selected
    }
  };

  // Function to get names based on selected IDs
  const getSelectedNames = (selectedIds, dataSet) => {
    return selectedIds
      .map((id) => {
        const item = dataSet.find((data) => data.id === id);
        return item ? item.name : "";
      })
      .join(", ");
  };

  const handleCreateTest = async () => {
    // Reset errors
    setErrors({ title: "", duration: "" });

    let valid = true;

    if (!testTitle.trim()) {
      setErrors((prev) => ({ ...prev, title: "Test title cannot be empty." }));
      valid = false;
    }

    if (!testDuration.trim()) {
      setErrors((prev) => ({
        ...prev,
        duration: "Test duration cannot be empty.",
      }));
      valid = false;
    } else if (isNaN(testDuration)) {
      setErrors((prev) => ({
        ...prev,
        duration: "Test duration must be a number.",
      }));
      valid = false;
    }

    if (valid) {
      // Create payload
      const payload = {
        data: {
          name: testTitle,
          duration: parseInt(testDuration, 10) || 0,
          question_banks: selectedQuestions,
          subject: Number(filters.subject),
          chapters: filters.chapter,
          topics: filters.topic,
          class: Number(filters.class),
          academic_year: Number(filters.academicYear),
          date: testDate,
          exam_name: examName,
          exam_type: Number(filters.type),
        },
      };

      toast.promise(
        fetch("/api/create-test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(
                  data.error || "An error occurred while creating the test"
                );
              });
            }
            return response.json();
          })
          .then((responseData) => {
            // Handle success: reset fields or show success message
            setSelectedQuestions([]);
            setTestTitle("");
            setTestDuration("");
            setTestDate("");
            setExamName("");
            setExamType("");
          }),
        {
          loading: "Creating test...",
          success: <b>Test created successfully!</b>,
          error: <b>Failed to create test. Please try again.</b>,
        },
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );
    }
  };

  const filteredChapters = data.chapters.filter(
    (chapter) => chapter.subjectId === Number(filters.subject)
  );
  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={true} />
      <div className="sectionHeader">Create Test</div>
      <div className="inputContainer">
        <select
          onChange={(e) => handleFilterChange("stream", e.target.value || null)}
        >
          <option value="">Select Stream</option>
          {data.streams.map((stream) => (
            <option key={stream.id} value={stream.id}>
              {stream.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) =>
            handleFilterChange("subject", e.target.value || null)
          }
        >
          <option value="">Select Subject</option>
          {data.subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <MultiSelectDropDown
          options={filteredChapters}
          selectedValues={filters.chapter}
          onChange={(selected) => handleFilterChange("chapter", selected)}
          placeholder="Select Chapters"
        />

        <MultiSelectDropDown
          options={data.topics.filter((topic) =>
            filters.chapter.includes(topic.chapterId)
          )}
          selectedValues={filters.topic}
          onChange={(selected) => handleFilterChange("topic", selected)}
          placeholder="Select Topics"
        />

        <select
          onChange={(e) =>
            handleFilterChange("academicYear", e.target.value || null)
          }
        >
          <option value="">Select Academic Year</option>
          {data.years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => handleFilterChange("level", e.target.value || null)} // Handle level change
        >
          <option value="">Select Level</option>
          {data.levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      <div className="formGroup">
        <input
          type="text"
          value={filters.question}
          onChange={(e) => handleFilterChange("question", e.target.value)}
          placeholder="Search Question"
        />
      </div>
      <div style={{ margin: "20px 0px" }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <MultiSelectDropDown
            options={questions.map((q) => ({
              id: q.id,
              name: q.question,
            }))}
            selectedValues={selectedQuestions}
            onChange={handleQuestionsChange}
            placeholder="Select Questions"
          />
        )}
      </div>

      {/* Display Selected Values */}
      <div className="selectedValuesContainer">
        <h3>Selected Questions:</h3>
        {selectedQuestions.length > 0 ? (
          <>
            {showTestInputs && (
              <div className="testActions">
                <div className="testDuration">
                  <div className="inputContainer">
                    <div className="formGroup">
                      <label>Test Title:</label>
                      <input
                        type="text"
                        placeholder="Physics Kinematics & Vector"
                        value={testTitle}
                        onChange={(e) => setTestTitle(e.target.value)}
                      />
                      {errors.title && (
                        <div className="errorText">{errors.title}</div>
                      )}
                    </div>
                  </div>
                  <div className="inputContainer">
                    <div className="formGroup">
                      <label>Exam Name:</label>
                      <input
                        type="text"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="JEE / NEET"
                      />
                      {errors.examName && (
                        <div className="errorText">{errors.examName}</div>
                      )}
                    </div>
                  </div>
                  <div className="inputContainer">
                    <div className="formGroup">
                      <label>Date:</label>
                      <input
                        type="date"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                      />
                      {errors.date && (
                        <div className="errorText">{errors.date}</div>
                      )}
                    </div>
                  </div>
                  <div className="inputContainer">
                    <div className="formGroup">
                      <label>Test Duration (in minutes):</label>
                      <input
                        type="text"
                        placeholder="20"
                        value={testDuration}
                        onChange={(e) => setTestDuration(e.target.value)}
                      />
                      {errors.duration && (
                        <div className="errorText">{errors.duration}</div>
                      )}
                    </div>
                  </div>
                  <select
                    onChange={(e) =>
                      handleFilterChange("type", e.target.value || null)
                    } // Handle type change
                  >
                    <option value="">Select Type</option>
                    {data.types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="submitButton" onClick={handleCreateTest}>
                  Creat Test
                </button>
              </div>
            )}

            {selectedQuestions.map((qId, id) => {
              const question = questions.find((q) => q.id === qId);
              return (
                <div className="questionItem" key={id}>
                  <div className="questionList">
                    {/* <strong>
                      Subject: {question.subject} | Chapter: {question.chapter}{" "}
                      | Topic: {question.topic}{" "}
                    </strong>

                    <strong>
                      | Class: {question.class} | Academic Year:{" "}
                      {question.academicYear}
                    </strong> */}

                    <div className="question">
                      {id + 1}: {question.question}
                    </div>
                    <div className="answers">
                      {question.options.map((answer, index) => (
                        <div
                          key={index}
                          className={`answer ${
                            question.correctOption == `answer_${index + 1}`
                              ? "highlight"
                              : ""
                          }`}
                        >
                          {index + 1}. {answer}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p>Select questions to create a test</p>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
