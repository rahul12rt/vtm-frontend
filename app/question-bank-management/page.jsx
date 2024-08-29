"use client";
import React, { useState, useEffect, useCallback } from "react";
import SearchableSingleSelect from "../_components/searchAbleDropDown";
import { FaEdit, FaTrash } from "react-icons/fa";

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

const QuestionBankManagement = () => {
  const [formData, setFormData] = useState({
    id: "",
    subject: "",
    chapter: "",
    topic: "",
    class: "",
    academicYear: "",
    question: "",
    answers: ["", "", "", ""],
    correctAnswerIndex: -1,
  });

  const [questions, setQuestions] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  // Handle subject change
  useEffect(() => {
    if (formData.subject) {
      setFilteredChapters(chaptersData[formData.subject] || []);
      if (!isEdit) {
        // Reset chapter and topic only when not in edit mode
        setFormData((prevData) => ({
          ...prevData,
          chapter: "",
          topic: "",
        }));
      }
    }
  }, [formData.subject, isEdit]);

  // Handle chapter change
  useEffect(() => {
    if (formData.chapter) {
      setFilteredTopics(topicsData[formData.chapter] || []);
      if (!isEdit) {
        // Reset topic only when not in edit mode
        setFormData((prevData) => ({
          ...prevData,
          topic: "",
        }));
      }
    }
  }, [formData.chapter, isEdit]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prevData) => {
      const newFormData = {
        ...prevData,
        [field]: value,
      };
      if (field === "subject") {
        return {
          ...newFormData,
          chapter: "", // Reset chapter
          topic: "", // Reset topic
        };
      }
      if (field === "chapter") {
        return {
          ...newFormData,
          topic: "", // Reset topic
        };
      }

      // Return updated form data for other fields
      return newFormData;
    });
  }, []);

  const handleAnswerChange = useCallback(
    (index, value) => {
      const newAnswers = [...formData.answers];
      newAnswers[index] = value;
      setFormData((prevData) => ({
        ...prevData,
        answers: newAnswers,
      }));
    },
    [formData.answers]
  );

  const handleCorrectAnswerChange = useCallback((index) => {
    setFormData((prevData) => ({
      ...prevData,
      correctAnswerIndex: index,
    }));
  }, []);

  const handleAddQuestion = useCallback(() => {
    const newQuestion = { ...formData, id: new Date().toISOString() };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    resetForm();
  }, [formData]);

  const handleUpdateQuestion = useCallback(() => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === formData.id ? { ...formData } : q))
    );
    resetForm();
  }, [formData]);

  const handleEditQuestion = useCallback(
    (id) => {
      const questionToEdit = questions.find((q) => q.id === id);
      if (questionToEdit) {
        setFormData(questionToEdit);
        setIsEdit(true);
        // Ensure correct chapter and topic filtering
        setFilteredChapters(chaptersData[questionToEdit.subject] || []);
        setFilteredTopics(topicsData[questionToEdit.chapter] || []);
      }
    },
    [questions]
  );

  const handleDeleteQuestion = useCallback((id) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      subject: "",
      chapter: "",
      topic: "",
      class: "",
      academicYear: "",
      question: "",
      answers: ["", "", "", ""],
      correctAnswerIndex: -1,
    });
    setFilteredChapters([]);
    setFilteredTopics([]);
    setIsEdit(false);
  }, []);

  const isFormValid = () => {
    return (
      formData.subject &&
      formData.chapter &&
      formData.topic &&
      formData.class &&
      formData.academicYear &&
      formData.question &&
      formData.correctAnswerIndex !== -1
    );
  };

  return (
    <div className="container">
      <div className="sectionHeader">Question Bank Management</div>
      <div className="inputContainer">
        <SearchableSingleSelect
          options={subjects}
          selectedValue={formData.subject}
          onChange={(value) => handleInputChange("subject", value)}
          placeholder="Select subject"
        />
        <SearchableSingleSelect
          options={filteredChapters}
          selectedValue={formData.chapter}
          onChange={(value) => handleInputChange("chapter", value)}
          placeholder="Select chapter"
        />
        <SearchableSingleSelect
          options={filteredTopics}
          selectedValue={formData.topic}
          onChange={(value) => handleInputChange("topic", value)}
          placeholder="Select topic"
        />
        <SearchableSingleSelect
          options={classes}
          selectedValue={formData.class}
          onChange={(value) => handleInputChange("class", value)}
          placeholder="Select class"
        />
        <SearchableSingleSelect
          options={academicYears}
          selectedValue={formData.academicYear}
          onChange={(value) => handleInputChange("academicYear", value)}
          placeholder="Select academic year"
        />
      </div>
      <textarea
        value={formData.question}
        onChange={(e) => handleInputChange("question", e.target.value)}
        placeholder="Enter the question"
        className="textArea"
      />
      <p style={{ fontSize: 14 }}>Click on checkbox to choose correct answer</p>
      <div className="inputContainer">
        {formData.answers.map((answer, index) => (
          <div key={index} className="checkBoxContainer">
            <input
              type="radio"
              checked={formData.correctAnswerIndex === index}
              onChange={() => handleCorrectAnswerChange(index)}
              className="checkbox"
            />
            <input
              type="text"
              value={answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder={`Answer ${index + 1}`}
              className="answerInput"
            />
          </div>
        ))}
        <button
          onClick={isEdit ? handleUpdateQuestion : handleAddQuestion}
          className="addButton"
          disabled={!isFormValid()}
        >
          {isEdit ? "Update" : "Add"}
        </button>
      </div>
      <div className="questionsList">
        {questions.map((question, id) => (
          <div key={question.id} className="questionItem">
            <div className="questionContainer">
              <div className="questionText">
                <strong>
                  Subject: {question.subject} | Chapter: {question.chapter} |
                  Topic: {question.topic}
                </strong>
                <br />
                <strong>
                  Class: {question.class} | Academic Year:{" "}
                  {question.academicYear}
                </strong>
                <div className="question">
                  Question {id + 1}: {question.question}
                </div>
                <div className="answers">
                  {question.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`answer ${
                        question.correctAnswerIndex === index ? "correct" : ""
                      }`}
                    >
                      {index + 1}. {answer}
                    </div>
                  ))}
                </div>
              </div>
              <div className="actions">
                <button
                  onClick={() => handleEditQuestion(question.id)}
                  className="editButton"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="deleteButton"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionBankManagement;
