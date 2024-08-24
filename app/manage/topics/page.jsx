"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Pagination from "../../_components/pagination";

const subjects = ["Math", "Science", "English", "History"];
const chapters = {
  Math: ["Algebra", "Geometry", "Calculus"],
  Science: ["Physics", "Chemistry", "Biology"],
  English: ["Literature", "Grammar", "Writing"],
  History: ["Ancient", "Medieval", "Modern"],
};

const ManageTopic = () => {
  const [topics, setTopics] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedChapter, setSelectedChapter] = useState(
    chapters[subjects[0]][0]
  );
  const [editIndex, setEditIndex] = useState(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filterSubject, filterChapter]);

  const handleAddTopic = () => {
    if (inputValue.trim()) {
      if (editIndex !== null) {
        const updatedTopics = topics.map((topic, index) =>
          index === editIndex
            ? {
                subject: selectedSubject,
                chapter: selectedChapter,
                topic: inputValue,
              }
            : topic
        );
        setTopics(updatedTopics);
        setEditIndex(null);
        setInputValue("");
      } else {
        setTopics([
          ...topics,
          {
            subject: selectedSubject,
            chapter: selectedChapter,
            topic: inputValue,
          },
        ]);
        setInputValue("");
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleEditTopic = (index) => {
    const actualIndex = filteredTopics[index]
      ? topics.indexOf(filteredTopics[index])
      : -1;
    if (actualIndex !== -1) {
      setEditIndex(actualIndex);
      setInputValue(filteredTopics[index].topic);
      setSelectedSubject(filteredTopics[index].subject);
      setSelectedChapter(filteredTopics[index].chapter);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleDeleteTopic = (index) => {
    const actualIndex = filteredTopics[index]
      ? topics.indexOf(filteredTopics[index])
      : -1;
    if (actualIndex !== -1) {
      const updatedTopics = topics.filter((_, i) => i !== actualIndex);
      setTopics(updatedTopics);

      const maxPage = Math.ceil(updatedTopics.length / itemsPerPage);
      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }

      if (editIndex !== null && editIndex === actualIndex) {
        setEditIndex(null);
        setInputValue("");
      }
    }
  };

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSelectedSubject(newSubject);
    setSelectedChapter(chapters[newSubject][0]); // Reset chapter to the first chapter of the new subject
  };

  const handleFilterSubjectChange = (e) => {
    setFilterSubject(e.target.value);
    setFilterChapter("");
  };

  const handleFilterChapterChange = (e) => {
    setFilterChapter(e.target.value);
  };

  const filteredTopics = topics.filter((topic) => {
    const subjectMatch = filterSubject ? topic.subject === filterSubject : true;
    const chapterMatch = filterChapter ? topic.chapter === filterChapter : true;
    return subjectMatch && chapterMatch;
  });

  const uniqueSubjects = Array.from(
    new Set(topics.map((topic) => topic.subject))
  );
  const uniqueChapters = Array.from(
    new Set(topics.map((topic) => topic.chapter))
  );

  const showFilterOptions =
    uniqueSubjects.length > 1 || uniqueChapters.length > 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTopics.length);
  const displayedTopics = filteredTopics.slice(startIndex, endIndex);

  useEffect(() => {
    if (filteredTopics.length === 0 && (filterSubject || filterChapter)) {
      setFilterSubject("");
      setFilterChapter("");
    }
  }, [filteredTopics.length, filterSubject, filterChapter]);

  return (
    <div className="container">
      <div className="sectionHeader">Manage Topics</div>
      <div className="inputContainer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a new topic"
          ref={inputRef}
        />
        <div className="formGroup" style={{ width: "100%" }}>
          <select
            id="subjects"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="selectTopics"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div className="formGroup" style={{ width: "100%" }}>
          <select
            id="chapters"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="selectTopics"
          >
            {chapters[selectedSubject].map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddTopic}
          className={editIndex !== null ? "updateButton" : "addButton"}
        >
          {editIndex !== null ? <FaEdit /> : <FaPlus />}
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      {showFilterOptions && (
        <div className="filterContainer">
          <div className="firstContainer">
            {uniqueSubjects.length > 1 && (
              <div className="formGroup">
                <label htmlFor="filter">Filter by Subject:</label>
                <select
                  id="filter"
                  value={filterSubject}
                  onChange={handleFilterSubjectChange}
                  className="filterSelect"
                  style={{ marginTop: 4 }}
                >
                  <option value="">All</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            {uniqueChapters.length > 1 && (
              <div className="formGroup">
                <label htmlFor="filter" className="chapterContainer">
                  Filter by Chapter:
                </label>
                <select
                  id="filter"
                  value={filterChapter}
                  onChange={handleFilterChapterChange}
                  className="filterSelect"
                >
                  <option value="">All</option>
                  {(filterSubject
                    ? chapters[filterSubject]
                    : uniqueChapters
                  ).map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      <ul className="todoList">
        {filteredTopics.length === 0 && (filterSubject || filterChapter) ? (
          <div className="noDataMessage">No data found</div>
        ) : (
          displayedTopics.map((topic, index) => (
            <li key={index} className="todoItem">
              <span>
                {startIndex + index + 1}.{" "}
                <span className="highlight">{topic.chapter}</span> -{" "}
                <span className="highlight">{topic.subject}</span> :{" "}
                {topic.topic}
              </span>
              <div className="buttonContainer">
                <button
                  onClick={() => handleEditTopic(index)}
                  className="editButton"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDeleteTopic(index)}
                  className="deleteButton"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <Pagination
        totalItems={filteredTopics.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default ManageTopic;
