"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";

const FilterQuestionsComponent = () => {
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
    assessments: [],
  });

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    years: false,
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
            filtersArray.push(
              `filters[question_banks][subject][id][$eq]=${filters.subject}`
            );
          }
          if (filters.chapter.length) {
            filtersArray.push(
              ...filters.chapter.map(
                (ch) => `filters[question_banks][chapters][id][$eq]=${ch}`
              )
            );
          }
          if (filters.topic.length) {
            filtersArray.push(
              ...filters.topic.map(
                (tp) => `filters[question_banks][topics][id][$eq]=${tp}`
              )
            );
          }
          if (filters.class) {
            filtersArray.push(
              `filters[question_banks][class][id][$eq]=${filters.class}`
            );
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
          topicsResponse,
          assessmentsResponse,
        ] = await Promise.all([
          fetch("/api/class"),
          fetch("/api/chapter"),
          fetch("/api/academic"),
          fetch("/api/topics"),
          fetch(`/api/create-test${queryString ? `?${queryString}` : ""}`),
        ]);

        const classesResult = await classesResponse.json();
        const chaptersResult = await chaptersResponse.json();
        const yearsResult = await yearsResponse.json();
        const topicsResult = await topicsResponse.json();
        const assessmentsResult = await assessmentsResponse.json();

        console.log(assessmentsResult);

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

        const topicsData = topicsResult.data.map((topic) => ({
          id: topic.id,
          name: topic.attributes.name,
          chapterId: topic.attributes.chapter.data.id,
        }));
        setData((prevState) => ({ ...prevState, topics: topicsData }));

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

        // Map the assessments to the required format
        const mappedAssessments = assessmentsResult.data.map((assessment) => {
          const chapterNames = assessment.attributes.chapters.data.map(
            (c) => c.attributes.name
          );
          const topicNames = assessment.attributes.topics.data.map(
            (c) => c.attributes.name
          );

          return {
            id: assessment.id,
            name: assessment.attributes.name,
            subject: assessment.attributes.subject.data.attributes.name,
            chapter: chapterNames.join(", "),
            topic: topicNames.join(", "),
            class: assessment.attributes.class.data.attributes.name,
            academicYear:
              assessment.attributes.academic_year.data.attributes.year,
            exam_name: assessment.attributes.exam_name,
          };
        });

        setData((prevState) => ({
          ...prevState,
          assessments: mappedAssessments,
        }));
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

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const filteredChapters = data.chapters.filter(
    (chapter) => chapter.subjectId === Number(filters.subject)
  );

  const filteredAssessments = data.assessments.filter((assessment) =>
    assessment.name.toLowerCase().includes(filters.question.toLowerCase())
  );

  return (
    <div className="container">
      <div className="sectionHeader">List of Tests</div>
      <div className="inputContainer">
        {/* <div className="formGroup"> */}
        {/* <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
          >
            <option value="">Select Subject</option>
            {data.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select> */}
        {/* </div> */}
        {/* <div className="formGroup">
          <MultiSelectDropDown
            options={filteredChapters}
            selectedValues={filters.chapter}
            onChange={(values) => handleFilterChange("chapter", values)}
            placeholder="Select Chapters"
          />
        </div> */}
        {/* Uncomment if needed */}
        {/* <div className="formGroup">
          <MultiSelectDropDown
            options={data.topics.filter((topic) =>
              filters.chapter.includes(topic.chapterId)
            )}
            selectedValues={filters.topic}
            onChange={(values) => handleFilterChange("topic", values)}
            placeholder="Select Topics"
          />
        </div> */}
        {/* <div className="formGroup">
          <select
            value={filters.class}
            onChange={(e) => handleFilterChange("class", e.target.value)}
          >
            <option value="">Select Class</option>
            {data.classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div> */}
        {/* Uncomment if needed */}
        {/* <div className="formGroup">
          <select
            value={filters.academicYear}
            onChange={(e) => handleFilterChange("academicYear", e.target.value)}
          >
            <option value="">Select Academic Year</option>
            {data.years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div> */}
      </div>
      <div className="formGroup">
        <input
          type="text"
          value={filters.question}
          onChange={(e) => handleFilterChange("question", e.target.value)}
          placeholder="Search by assessment"
        />
      </div>
      <div>
        <h2>Assessments</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="questionList">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "50%" }}>Name</th>
                  <th>Subject</th>
                  <th>Name</th>
                  {/* Uncomment if needed */}
                  {/* <th>Topic</th> */}
                  <th>Class</th>
                  <th>Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td>{assessment.name}</td>
                    <td>{assessment.subject}</td>
                    <td>{assessment.exam_name}</td>
                    {/* Uncomment if needed */}
                    {/* <td>{assessment.topic}</td> */}
                    <td>{assessment.class}</td>
                    <td>{assessment.academicYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterQuestionsComponent;
