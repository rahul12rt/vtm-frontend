"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "../_utils/encryptionUtils";
import Cookies from "js-cookie";
import styles from "./Test.module.css"; // Import the CSS module
import toast, { Toaster } from "react-hot-toast";

const Test = () => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [timer, setTimer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const encryptedId = Cookies.get("utmt_id");
    if (encryptedId) {
      const id = decrypt(encryptedId);
      const fetchData = async () => {
        try {
          const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
          const testsEndpoint = `${strapiApiUrl}/api/assign-tests?filters[Assign][$eq]=true&filters[create_test][id][$eq]=${id}&populate[create_test][populate]=class,academic_year,subject,question_banks,exam_type`;
          const bearerToken = Cookies.get("token");

          const response = await fetch(testsEndpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const result = await response.json();
          const modifiedResult = JSON.parse(JSON.stringify(result));

          const examType =
            modifiedResult.data[0]?.attributes?.create_test?.data?.attributes
              ?.exam_type?.data?.attributes?.type;

          // Shuffle questions if they exist
          if (
            modifiedResult.data[0]?.attributes?.create_test?.data?.attributes
              ?.question_banks?.data
          ) {
            const questions =
              modifiedResult.data[0].attributes.create_test.data.attributes
                .question_banks.data;
            const shuffledQuestions = shuffleQuestions(questions, examType);
            modifiedResult.data[0].attributes.create_test.data.attributes.question_banks.data =
              shuffledQuestions;
          }

          setData(modifiedResult.data);

          // Set initial timer value
          const initialDuration =
            modifiedResult.data[0].attributes.create_test.data.attributes
              .duration;
          setTimer(initialDuration * 60);
        } catch (err) {
          console.error("Failed to fetch data:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [router]);

  const shuffleOptions = (questionAttributes, examType) => {
    const originalOptions = [];

    for (let i = 1; i <= 5; i++) {
      const answerKey = `answer_${i}`;
      if (questionAttributes[answerKey]) {
        originalOptions.push({
          key: answerKey,
          value: questionAttributes[answerKey],
        });
      }
    }

    for (let i = originalOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalOptions[i], originalOptions[j]] = [
        originalOptions[j],
        originalOptions[i],
      ];
    }

    return originalOptions;
  };

  const shuffleQuestions = (questions, examType) => {
    const shuffledQuestions = [...questions];

    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];

      // Add shuffled options to each question, passing the exam type
      const shuffledOptions = shuffleOptions(
        shuffledQuestions[i].attributes,
        examType
      );
      shuffledQuestions[i].attributes.shuffledOptions = shuffledOptions;
    }

    // Don't forget the first question
    if (shuffledQuestions.length > 0) {
      shuffledQuestions[0].attributes.shuffledOptions = shuffleOptions(
        shuffledQuestions[0].attributes,
        examType
      );
    }

    return shuffledQuestions;
  };

  useEffect(() => {
    let interval;
    if (timer !== null) {
      interval = setInterval(() => {
        setTimer((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Handle answer selection and lock the question
  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setLockedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const allQuestions =
        data[0].attributes.create_test.data.attributes.question_banks.data;
      const isExamType =
        data[0].attributes.create_test.data.attributes.exam_type.data.attributes
          .type === "Exam";

      const results = allQuestions.map((question) => {
        const questionId = question.id.toString();
        const answerKey = selectedAnswers[questionId];

        // Find the selected option if an answer was chosen
        const selectedOption = answerKey
          ? question.attributes.shuffledOptions.find(
              (opt) => opt.key === answerKey
            )
          : null;

        return {
          id: questionId,
          question: question.attributes.question,
          selectedAnswer: answerKey || null,
          selectedText: selectedOption ? selectedOption.value : null,
          correctAnswer: question.attributes.correct_answer,
          correctText: question.attributes[question.attributes.correct_answer],
        };
      });

      let score = 0;
      results.forEach((result) => {
        if (result.selectedAnswer === result.correctAnswer) {
          score += 1; // Correct answer: +1 point
        } else if (isExamType && result.selectedAnswer !== null) {
          score -= 1; // Incorrect answer in Exam type: -0.25 points
        }
      });

      const totalQuestions = allQuestions.length;

      const sId = Cookies.get("utms_id");
      const encryptedId = Cookies.get("utmt_id");
      const id = decrypt(encryptedId);

      const payload = {
        data: {
          create_test: parseInt(id),
          student: parseInt(sId),
          total: totalQuestions,
          obtained: score,
          test_info: JSON.stringify(results),
        },
      };

      toast.loading("Submitting your results...");
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to submit the results:", errorData);
        toast.dismiss();
        toast.error("Unable to submit the results. Please try again.");
      } else {
        const responseData = await response.json();
        toast.dismiss();
        toast.success("Results submitted successfully!");
        Cookies.remove("utmt_id");
        router.push("/success");
      }
    } catch (error) {
      console.error("Error submitting results:", error);
      toast.dismiss();
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      {data && data.length > 0 ? (
        <>
          {/* Render Test Details */}
          {data.map((item) => {
            const questionPaper = item.attributes.create_test.data.attributes;
            const examType = questionPaper.exam_type.data.attributes.type;
            const { class: classInfo, academic_year, subject } = questionPaper;

            // Add the duration to the test information
            const duration = questionPaper.duration; // Duration in minutes

            return (
              <div key={item.id} className={styles.testSection}>
                <h1 className={styles.testTitle}>
                  {item.attributes.create_test.data.attributes.exam_name ||
                    "N/A"}{" "}
                  &nbsp;{item.attributes.create_test.data.attributes.name}
                </h1>
                {/* Test Details */}
                <div className={styles.testDetails}>
                  <div className={styles.testInfo}>
                    <p>
                      <strong> Subject:</strong>{" "}
                      {subject?.data?.attributes?.name || "N/A"} |
                      <strong> Class:</strong>{" "}
                      {classInfo?.data?.attributes?.name || "N/A"} |
                      <strong> Date:</strong>{" "}
                      {item.attributes.create_test.data.attributes.date ||
                        "N/A"}{" "}
                      |<strong> Duration:</strong>{" "}
                      {duration ? `${duration} minutes` : "N/A"}
                    </p>
                  </div>
                  <div className={styles.timerContainerSticky}>
                    {/* Sticky Timer */}
                    <span className={styles.timerLabel}>Time Remaining: </span>
                    <span className={styles.timerValue}>
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>

                {/* Instructions List */}
                <div className={styles.testInstructions}>
                  <h2>**Instructions**</h2>
                  <ul>
                    <li>
                      1. Choose the correct answer from the four given options
                      for each question.
                    </li>
                    <li>
                      2. You can select an option only once, and answers cannot
                      be changed.
                    </li>
                    <li>
                      3. Each question must be answered before submitting the
                      test.
                    </li>
                    <li>
                      4. Manage your time wisely, as the timer will count down
                      automatically.
                    </li>
                  </ul>
                </div>

                {/* Questions Section */}

                <div className={styles.questionsContainer}>
                  {questionPaper.question_banks.data.map((question, index) => (
                    <div key={question.id} className={styles.questionItem}>
                      <p>
                        <strong>
                          Total Questions:{" "}
                          {questionPaper.question_banks?.data?.length || "N/A"}
                        </strong>
                      </p>

                      <p>
                        <strong>Question {index + 1}:</strong>{" "}
                        {question.attributes.question}
                      </p>
                      <div className={styles.optionsContainer}>
                        {question.attributes.shuffledOptions?.map((option) => {
                          const isLocked = lockedQuestions[question.id];
                          const isSelected =
                            selectedAnswers[question.id] === option.key;
                          return (
                            <label
                              key={option.key}
                              className={`${styles.optionLabel} ${
                                isSelected && isLocked
                                  ? styles.disabledSelected
                                  : isSelected
                                  ? styles.active
                                  : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option.key}
                                checked={isSelected}
                                onChange={() =>
                                  handleAnswerChange(question.id, option.key)
                                }
                                disabled={isLocked}
                              />
                              <span>{option.value}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSubmit}
                    className="submitButton"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div>No data found</div>
      )}
    </div>
  );
};

export default Test;
