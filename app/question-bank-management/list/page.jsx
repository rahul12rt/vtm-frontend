"use client";
import React, { useState, useCallback, useEffect } from "react";
import SearchableSingleSelect from "../../_components/searchAbleDropDownv2";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    subject: "",
    chapter: [],
    topic: [],
    class: "",
    academicYear: "",
    question: "",
  });
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
  const [editingId, setEditingId] = useState(null);

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
        console.log(queryString);

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

        const classesResult = await classesResponse.json();
        const chaptersResult = await chaptersResponse.json();
        const yearsResult = await yearsResponse.json();
        const questionsResult = await questionsResponse.json();

        console.log(questionsResult);

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

        const chapterIds = chaptersData.map((chapter) => chapter.id);
        const topicQueryString = chapterIds
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

  const handleEditClick = (id) => {
    setEditingId(id);
  };

  const handleSaveClick = (id, updatedQuestion) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === id ? updatedQuestion : question
      )
    );
    setEditingId(null);
  };

  const handleDeleteClick = (id) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((question) => question.id !== id)
    );
  };

  const handleOptionChange = (questionId, optionIndex, newValue) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? newValue : option
              ),
            }
          : question
      )
    );
  };

  return (
    <div className="container">
      <div className="sectionHeader">List of Questions</div>
      <div className="inputContainer">
        <div className="formGroup">
          <SearchableSingleSelect
            options={data.subjects}
            selectedValue={filters.subject}
            onChange={(value) => handleFilterChange("subject", value)}
            placeholder="Select Subject"
          />
        </div>
        <div className="formGroup">
          <MultiSelectDropDown
            options={data.chapters}
            selectedValues={filters.chapter}
            onChange={(values) => handleFilterChange("chapter", values)}
            placeholder="Select Chapters"
          />
        </div>
        <div className="formGroup">
          <MultiSelectDropDown
            options={data.topics}
            selectedValues={filters.topic}
            onChange={(values) => handleFilterChange("topic", values)}
            placeholder="Select Topics"
          />
        </div>
        <div className="formGroup">
          <SearchableSingleSelect
            options={data.classes}
            selectedValue={filters.class}
            onChange={(value) => handleFilterChange("class", value)}
            placeholder="Select Class"
          />
        </div>
        <div className="formGroup">
          <SearchableSingleSelect
            options={data.years}
            selectedValue={filters.academicYear}
            onChange={(value) => handleFilterChange("academicYear", value)}
            placeholder="Select Academic Year"
          />
        </div>
      </div>
      <div className="formGroup">
        <input
          type="text"
          value={filters.question}
          onChange={(e) => handleFilterChange("question", e.target.value)}
          placeholder="Search Question"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Question</th>
              <th>Subject</th>
              <th>Chapter</th>
              <th>Topic</th>
              <th>Class</th>
              <th>Academic Year</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>
                  {editingId === question.id ? (
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleSaveClick(question.id, {
                          ...question,
                          question: e.target.value,
                        })
                      }
                    />
                  ) : (
                    question.question
                  )}
                </td>
                <td>{question.subject}</td>
                <td>{question.chapter}</td>
                <td>{question.topic}</td>
                <td>{question.class}</td>
                <td>{question.academicYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default QuestionsList;
