"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropDown from "../_components/multiSelectDropDown2";
import SearchableSingleSelect from "../_components/searchAbleDropDownv2";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const QuestionBank = () => {
  const [formData, setFormData] = useState({
    selectedClass: "",
    selectedSubject: "",
    selectedChapters: [],
    selectedTopics: [],
    selectedYear: "",
    selectedLevel: "",
    selectedStream: "",
    question: "",
    answers: ["", "", "", ""],
    correctAnswerIndex: null, // Store the correct answer as an index
  });

  const [editIndex, setEditIndex] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    subjects: false,
    chapters: false,
    topics: false,
    years: false,
    levels: false,
  });
  const [data, setData] = useState({
    classes: [],
    subjects: [],
    chapters: [],
    topics: [],
    years: [],
    levels: [],
    streams: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDropdownLoading((prevState) => ({
        ...prevState,
        years: true,
        levels: true,
      }));

      try {
        const [
          chaptersResponse,
          yearsResponse,
          questionsResponse,
          levelsResponse,
          streamResponse,
        ] = await Promise.all([
          fetch("/api/chapter"),
          fetch("/api/academic"),
          fetch("/api/question-bank"),
          fetch("/api/levels"),
          fetch("/api/streams"),
        ]);

        const chaptersResult = await chaptersResponse.json();
        const yearsResult = await yearsResponse.json();
        const questionsResult = await questionsResponse.json();
        const levelsResult = await levelsResponse.json();
        const streamResult = await streamResponse.json();

        const streamData = streamResult.data.map((stream) => ({
          id: stream.id,
          name: stream.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, streams: streamData }));

        const levelsData = levelsResult.data.map((level) => ({
          id: level.id,
          name: level.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, levels: levelsData }));

        const yearsData = yearsResult.data.map((year) => ({
          id: year.id,
          year: year.attributes.year,
        }));
        setData((prevState) => ({ ...prevState, years: yearsData }));

        const chaptersData = chaptersResult.data.map((chapter) => ({
          id: chapter.id,
          name: chapter.attributes.name,
          subjectId: chapter.attributes.subject.data.id,
          subjectName: chapter.attributes.subject.data.attributes.name,
          className:
            chapter.attributes.subject.data.attributes.class.data.attributes
              .name,
        }));
        setData((prevState) => ({ ...prevState, chapters: chaptersData }));

        // Modified to include class information in subject name
        const uniqueSubjects = chaptersData.reduce((acc, chapter) => {
          if (!acc.find((subject) => subject.id === chapter.subjectId)) {
            acc.push({
              id: chapter.subjectId,
              name: `${chapter.subjectName} (${chapter.className})`,
              rawName: chapter.subjectName,
              className: chapter.className,
            });
          }
          return acc;
        }, []);
        setData((prevState) => ({ ...prevState, subjects: uniqueSubjects }));

        const chapterIds = chaptersData.map((chapter) => chapter.id);
        const queryString = chapterIds
          .map((id) => `filters[chapter][id][$eq]=${id}`)
          .join("&");
        const topicsResponse = await fetch(
          `/api/topics?populate[chapter]=*&${queryString}`
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
          answers: [
            item.attributes.answer_1,
            item.attributes.answer_2,
            item.attributes.answer_3,
            item.attributes.answer_4,
            item.attributes.answer_5, // Add answer_5 to the array
          ].filter((answer) => answer !== null),
          correctAnswer: item.attributes.correct_answer,
          subject: `${item.attributes.subject.data.attributes.name} (${item.attributes.subject.data.attributes.class.data.attributes.name})`,
          chapter: item.attributes.chapters.data
            .map((chap) => chap.attributes.name)
            .join(", "),
          topic: item.attributes.topics.data
            .map((top) => top.attributes.name)
            .join(", "),
          academicYear: item.attributes.academic_year.data.attributes.year,
          level: item.attributes.level
            ? item.attributes.level.data.attributes.name
            : "N/A",
          stream: item.attributes.stream
            ? item.attributes.stream.data.attributes.name
            : "N/A",
        }));
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
        setDropdownLoading((prevState) => ({
          ...prevState,
          years: false,
          levels: false,
        }));
      }
    };

    fetchData();
  }, []);

  const handleEdit = (question) => {
    if (!question) return;
    const questionEdit = questions.find((q) => q.id === question);

    const answers = [
      questionEdit.answers[0],
      questionEdit.answers[1],
      questionEdit.answers[2],
      questionEdit.answers[3],
    ];

    // Add fifth answer if it exists
    if (questionEdit.answers[4]) {
      answers.push(questionEdit.answers[4]);
    }

    const selectedClassOption = data.classes.find(
      (cls) => cls.name === questionEdit.class
    );

    const selectedLevelOption = data.levels.find(
      (cls) => cls.name === questionEdit.level
    );

    const selectedAcademicYearOption = data.years.find(
      (cls) => cls.year === questionEdit.academicYear
    );

    const selectedStreamOption = data.streams.find(
      (str) => str.name === questionEdit.stream
    );

    const selectedSubjectOption = data.subjects.find(
      (sub) => sub.name === questionEdit.subject
    );

    const selectedChaptersWithIds = data.chapters
      .filter((chapter) => questionEdit.chapter.includes(chapter.name))
      .map((chapter) => chapter.id);

    const selectedTopicsWithIds = data.topics
      .filter((chapter) => questionEdit.topic.includes(chapter.name))
      .map((chapter) => chapter.id);

    const answerIndex = questionEdit.correctAnswer.split("_")[1];

    const correctAnswerIndex = parseInt(answerIndex - 1);
    setFormData({
      selectedSubject: selectedSubjectOption.id || "",
      selectedChapters: selectedChaptersWithIds || [], // Set defaults as empty
      selectedTopics: selectedTopicsWithIds || [], // Set defaults as empty
      question: questionEdit.question || "", // Ensure this exists
      answers: answers,
      selectedYear: selectedAcademicYearOption.id,
      correctAnswerIndex: correctAnswerIndex,
      selectedLevel: selectedLevelOption.id,
      selectedStream: selectedStreamOption ? selectedStreamOption.id : "",
    });

    setEditIndex(question);
  };

  const handleInputChange = (field, value) => {
    if (field === "selectedStream") {
      // When stream changes, handle the answers array
      const isCET =
        data.streams.find((stream) => stream.id === value)?.name === "CET";
      const newAnswers = isCET ? ["", "", "", "", ""] : ["", "", "", ""];

      setFormData((prevState) => ({
        ...prevState,
        [field]: value,
        answers: newAnswers.map((newAns, idx) =>
          idx < prevState.answers.length ? prevState.answers[idx] : newAns
        ),
        correctAnswerIndex: prevState.correctAnswerIndex,
      }));
    } else if (field === "selectedSubject") {
      setFormData((prevState) => ({
        ...prevState,
        selectedSubject: value,
        selectedChapters: [],
        selectedTopics: [],
      }));
    } else if (field === "selectedChapters") {
      setFormData((prevState) => ({
        ...prevState,
        selectedChapters: value,
        selectedTopics: [],
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...formData.answers];
    updatedAnswers[index] = value;
    setFormData((prevState) => ({ ...prevState, answers: updatedAnswers }));
  };

  const handleCorrectAnswerChange = (index) => {
    setFormData((prevState) => ({ ...prevState, correctAnswerIndex: index }));
  };

  const filteredChapters = data.chapters.filter(
    (chapter) => chapter.subjectId === Number(formData.selectedSubject)
  );

  const handleAdd = async () => {
    const payload = {
      data: {
        subject: formData.selectedSubject,
        chapters: formData.selectedChapters,
        topics: formData.selectedTopics,
        academic_year: formData.selectedYear,
        level: formData.selectedLevel,
        question: formData.question,
        answer_1: formData.answers[0],
        answer_2: formData.answers[1],
        answer_3: formData.answers[2],
        answer_4: formData.answers[3],
        answer_5: formData.answers[4] || null,
        correct_answer:
          formData.correctAnswerIndex !== null
            ? `answer_${formData.correctAnswerIndex + 1}`
            : null,
        stream: formData.selectedStream,
      },
    };

    toast.promise(
      fetch("/api/question-bank", {
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
                data.error || "Failed to add question. Please try again."
              );
            });
          }
          return response.json();
        })
        .then((result) => {
          // Map the new question and append it to existing questions

          const newQuestion = {
            id: result.data.id,
            question: result.data.attributes.question,
            answers: [
              result.data.attributes.answer_1,
              result.data.attributes.answer_2,
              result.data.attributes.answer_3,
              result.data.attributes.answer_4,
              result.data.attributes.answer_5, // Add answer_5 to the answers array
            ].filter((answer) => answer !== null), // Filter out null answers
            correctAnswer: result.data.attributes.correct_answer,
            subject: result.data.attributes.subject.data.attributes.name,
            chapter: result.data.attributes.chapters.data.map(
              (chap) => chap.attributes.name
            ),
            topic: result.data.attributes.topics.data.map(
              (top) => top.attributes.name
            ),
            class:
              result.data.attributes.subject.data.attributes.class.data
                .attributes.name,
            academicYear:
              result.data.attributes.academic_year.data.attributes.year,
            level: result.data.attributes.level.data.attributes.name,
            stream: result.data.attributes.stream.data.attributes.name,
          };

          // Update the questions state with the new question
          setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);

          // Optionally, clear the form or update the UI with the new question
          setFormData({
            selectedClass: "",
            selectedSubject: "",
            selectedChapters: [],
            selectedTopics: [],
            selectedYear: "",
            question: "",
            answers: ["", "", "", ""],
            correctAnswerIndex: null,
            level: "",
          });
        }),
      {
        loading: "Adding question...",
        success: <b>Question added successfully!</b>,
        error: <b>Failed to add question. Please try again.</b>,
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );
  };

  const handleDelete = async (id) => {
    toast.promise(
      fetch("/api/question-bank", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qbId: id }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                data.error || "Failed to delete question. Please try again."
              );
            });
          }
          return response.json();
        })
        .then((result) => {
          // Remove the deleted question from the state
          setQuestions((prevQuestions) =>
            prevQuestions.filter((question) => question.id !== id)
          );
        }),
      {
        loading: "Deleting question...",
        success: <b>Question deleted successfully!</b>,
        error: <b>Failed to delete question. Please try again.</b>,
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );
  };
  const handleUpdate = async () => {
    if (!editIndex) {
      toast.error("Please select a question to update");
      return;
    }

    const payload = {
      data: {
        subject: formData.selectedSubject,
        chapters: formData.selectedChapters,
        topics: formData.selectedTopics,
        class: formData.selectedClass,
        academic_year: formData.selectedYear,
        level: formData.selectedLevel,
        question: formData.question,
        answer_1: formData.answers[0],
        answer_2: formData.answers[1],
        answer_3: formData.answers[2],
        answer_4: formData.answers[3],
        answer_5: formData.answers[4] || null,
        correct_answer:
          formData.correctAnswerIndex !== null
            ? `answer_${formData.correctAnswerIndex + 1}`
            : null,
        stream: formData.selectedStream,
      },
    };

    toast.promise(
      fetch("/api/question-bank", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qbId: editIndex,
          payload: payload,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                data.error || "Failed to update question. Please try again."
              );
            });
          }
          return response.json();
        })
        .then((result) => {
          // Update the questions state
          setQuestions((prevQuestions) =>
            prevQuestions.map((question) =>
              question.id === editIndex
                ? {
                    id: result.data.id,
                    question: result.data.attributes.question,
                    answers: [
                      result.data.attributes.answer_1,
                      result.data.attributes.answer_2,
                      result.data.attributes.answer_3,
                      result.data.attributes.answer_4,
                      result.data.attributes.answer_5, // Add answer_5 to the answers array
                    ].filter((answer) => answer !== null), // Filter out null answers
                    correctAnswer: result.data.attributes.correct_answer,
                    subject:
                      result.data.attributes.subject.data.attributes.name,
                    chapter: result.data.attributes.chapters.data.map(
                      (chap) => chap.attributes.name
                    ),
                    topic: result.data.attributes.topics.data.map(
                      (top) => top.attributes.name
                    ),
                    level: result.data.attributes.level.data.attributes.name,
                    class:
                      result.data.attributes.subject.data.attributes.class.data
                        .attributes.name,
                    academicYear:
                      result.data.attributes.academic_year.data.attributes.year,
                    stream: result.data.attributes.stream.data.attributes.name,
                  }
                : question
            )
          );

          // Reset form and editIndex
          setFormData({
            selectedClass: "",
            selectedSubject: "",
            selectedChapters: [],
            selectedTopics: [],
            selectedYear: "",
            question: "",
            answers: ["", "", "", ""],
            correctAnswerIndex: null,
          });
          setEditIndex(null);
        }),
      {
        loading: "Updating question...",
        success: <b>Question updated successfully!</b>,
        error: <b>Failed to update question. Please try again.</b>,
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );
  };

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">Question Bank</div>

      <div className="inputContainer">
        <div className="formGroup">
          <SearchableSingleSelect
            options={data.subjects}
            selectedValue={formData.selectedSubject}
            onChange={(value) => handleInputChange("selectedSubject", value)}
            placeholder="Select subject (Class)"
            isLoading={dropdownLoading.subjects}
          />
        </div>
        <div className="formGroup">
          <MultiSelectDropDown
            options={filteredChapters}
            selectedValues={formData.selectedChapters}
            onChange={(values) => handleInputChange("selectedChapters", values)}
            placeholder="Select chapters"
            isLoading={dropdownLoading.chapters}
          />
        </div>
        <div className="formGroup">
          <MultiSelectDropDown
            options={data.topics.filter((topic) =>
              formData.selectedChapters.includes(topic.chapterId)
            )}
            selectedValues={formData.selectedTopics}
            onChange={(values) => handleInputChange("selectedTopics", values)}
            placeholder="Select topics"
            isLoading={dropdownLoading.topics}
          />
        </div>
        <div className="formGroup">
          <SearchableSingleSelect
            options={data.streams}
            selectedValue={formData.selectedStream}
            onChange={(value) => handleInputChange("selectedStream", value)}
            placeholder="Select Stream"
            isLoading={dropdownLoading.streams}
          />
        </div>

        <div className="formGroup">
          <SearchableSingleSelect
            options={data.years.map((year) => ({
              id: year.id,
              name: year.year,
            }))}
            selectedValue={formData.selectedYear}
            onChange={(value) => handleInputChange("selectedYear", value)}
            placeholder="Select Academic Year"
            isLoading={dropdownLoading.years}
          />
        </div>
        <div className="formGroup">
          <SearchableSingleSelect
            options={data.levels}
            selectedValue={formData.selectedLevel}
            onChange={(value) => handleInputChange("selectedLevel", value)}
            placeholder="Select Level"
            isLoading={dropdownLoading.levels}
          />
        </div>
      </div>

      <textarea
        placeholder="Enter the question"
        className="textArea"
        value={formData.question}
        onChange={(e) => handleInputChange("question", e.target.value)}
      />

      <div className="inputContainer">
        <div className="inputContainer">
          {formData.answers.map((answer, index) => (
            <div key={index} className="checkBoxContainer">
              <input
                type="radio"
                className="checkbox"
                checked={formData.correctAnswerIndex === index}
                onChange={() => handleCorrectAnswerChange(index)}
              />
              <input
                type="text"
                placeholder={`Answer ${index + 1}`}
                className="answerInput"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className="addButton"
        onClick={editIndex ? handleUpdate : handleAdd}
      >
        {editIndex ? "Update" : "Add"}
      </button>
      {loading ? (
        <div className="loader" style={{ marginTop: 50 }}>
          Loading...
        </div>
      ) : (
        <div className="questionsList" style={{ marginTop: 50 }}>
          <h2>Questions List</h2>
          {questions.map((question, index) => (
            <div key={question.id} className="questionItem">
              <div className="questionContainer">
                <div className="questionText">
                  <strong>
                    Subject: {question.subject} | Chapter: {question.chapter} |
                    Topic: {question.topic} | Level: {question.level} | Stream:{" "}
                    {question.stream}
                  </strong>{" "}
                  <strong>| Academic Year: {question.academicYear}</strong>
                  <div className="questionList">
                    <div className="question">
                      {index + 1}: {question.question}
                    </div>
                    <div className="answers">
                      {question.answers
                        .filter((answer) => answer !== null)
                        .map((answer, index) => (
                          <div
                            key={index}
                            className={`answer ${
                              question.correctAnswer === `answer_${index + 1}`
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
                <div className="buttonContainer">
                  <button
                    onClick={() => handleEdit(question.id)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
