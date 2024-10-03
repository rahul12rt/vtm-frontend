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
    academicYear: null,
    question: "",
  });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showTestInputs, setShowTestInputs] = useState(false); // State to track whether to show inputs
  const [testTitle, setTestTitle] = useState(""); // State to track test title
  const [testDuration, setTestDuration] = useState(""); // State to track test duration
  const [data, setData] = useState({
    subjects: [],
    chapters: [],
    topics: [],
    classes: [],
    years: [],
  });
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    years: false,
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
        classes: true,
        years: true,
      }));

      try {
        // Build query string for filters
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
          if (filters.class) {
            filtersArray.push(`filters[class][id][$eq]=${filters.class}`);
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

          return filtersArray.join("&");
        };

        const queryString = buildQueryString();

        const [
          classesResponse,
          chaptersResponse,
          yearsResponse,
          questionsResponse,
        ] = await Promise.all([
          fetch("/api/class"),
          fetch("/api/chapter"),
          fetch("/api/academic"),
          fetch(`/api/filter-questions${queryString ? `?${queryString}` : ""}`),
        ]);

        console.log(queryString);

        const classesResult = await classesResponse.json();
        const chaptersResult = await chaptersResponse.json();
        const yearsResult = await yearsResponse.json();
        const questionsResult = await questionsResponse.json();

        console.log(questionsResult);

        // Map the API data to your component's structure
        const classesData = classesResult.data.map((classItem) => ({
          id: classItem.id,
          name: classItem.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, classes: classesData }));

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

        // Extract unique subjects from chapters data
        const uniqueSubjects = chaptersData.reduce((acc, chapter) => {
          if (!acc.find((subject) => subject.id === chapter.subjectId)) {
            acc.push({
              id: chapter.subjectId,
              name: chapter.subjectName,
            });
          }
          return acc;
        }, []);
        setData((prevState) => ({ ...prevState, subjects: uniqueSubjects }));

        // Fetch topics based on the chapters
        const chapterIds = chaptersData.map((chapter) => chapter.id);
        const topicQueryString = chapterIds
          .map((id) => `filters[chapter][id][$eq]=${id}`)
          .join("&");
        const topicsResponse = await fetch(
          `/api/topics?populate[chapter]=*&${topicQueryString}`
        );

        console.log(topicQueryString);
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
          ],
          correctOption: item.attributes.correct_answer,
          subject: item.attributes.subject.data.attributes.name,
          chapter: item.attributes.chapters.data
            .map((chap) => chap.attributes.name)
            .join(", "),
          topic: item.attributes.topics.data
            .map((top) => top.attributes.name)
            .join(", "),
          class: item.attributes.class.data.attributes.name,
          academicYear: item.attributes.academic_year.data.attributes.year,
        }));
        console.log(mappedQuestions);
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
        setDropdownLoading((prevState) => ({
          ...prevState,
          classes: false,
          years: false,
        }));
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
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
            console.log("Test created successfully:", responseData);
            // Handle success: reset fields or show success message
            setSelectedQuestions([]);
            setTestTitle("");
            setTestDuration("");
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
          onChange={(e) => handleFilterChange("class", e.target.value || null)}
        >
          <option value="">Select Class</option>
          {data.classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>

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
                      <label>Test Duration (in minutes):</label>
                      <input
                        type="text"
                        value={testDuration}
                        onChange={(e) => setTestDuration(e.target.value)}
                      />
                      {errors.duration && (
                        <div className="errorText">{errors.duration}</div>
                      )}
                    </div>
                  </div>
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
                    {console.log(question)}
                    <div className="question">
                      {id + 1}: {question.question}
                    </div>
                    <div className="answers">
                      {question.options.map((answer, index) => (
                        <div
                          key={index}
                          className={`answer ${
                            question.correctOption == index ? "highlight" : ""
                          }`}
                        >
                          {console.log(question.correctOption)}
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
