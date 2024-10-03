"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const ManageTopic = () => {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
    fetchTopics();
  }, []);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chapter");
      if (!response.ok) {
        throw new Error("Failed to fetch chapters");
      }
      const data = await response.json();
      const subjectsSet = new Set();
      const chaptersMap = {};

      data.data.forEach((item) => {
        const subjectName = item.attributes.subject.data.attributes.name;
        const chapterId = item.id;
        const chapterName = item.attributes.name;

        subjectsSet.add(subjectName);

        if (!chaptersMap[subjectName]) {
          chaptersMap[subjectName] = [];
        }

        chaptersMap[subjectName].push({ id: chapterId, name: chapterName });
      });

      setSubjects(Array.from(subjectsSet));
      setChapters(chaptersMap);

      const firstSubject = Array.from(subjectsSet)[0];
      setSelectedSubject(firstSubject);
      setSelectedChapterId(chaptersMap[firstSubject][0]?.id || "");
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast.error("Failed to fetch chapters.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/topics");

      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }
      const data = await response.json();
      console.log(data);
      const formattedTopics = data.data.map((item) => {
        const chapter = item.attributes.chapter.data;
        const subject = chapter.attributes.subject.data.attributes.name;
        const chapterName = chapter.attributes.name;
        const topicName = item.attributes.name;
        const topicId = item.id;

        return {
          id: topicId,
          subject,
          chapter: chapterName,
          topic: topicName,
        };
      });
      setTopics(formattedTopics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Failed to fetch topics.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setInputValue(topic.topic);
    setSelectedSubject(topic.subject);
    const chapterId = Object.keys(chapters).find((subject) =>
      chapters[subject].some((chap) => chap.name === topic.chapter)
    );
    setSelectedChapterId(
      chapters[chapterId]?.find((chap) => chap.name === topic.chapter)?.id || ""
    );
  };

  const handleDeleteTopic = async (id) => {
    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/topics", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topicsId: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete topic");
        }

        setTopics((prevTopics) =>
          prevTopics.filter((topic) => topic.id !== id)
        );
      })(),
      {
        loading: "Deleting topic...",
        success: "Topic deleted successfully.",
        error: "Failed to delete topic.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    await action;
  };

  const handleAddTopic = async () => {
    if (!inputValue || !selectedChapterId) return;

    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/topics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              name: inputValue,
              chapter: selectedChapterId,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add topic");
        }

        const newTopic = await response.json();
        await fetchTopics();
        // setTopics((prevTopics) => [
        //   ...prevTopics,
        //   {
        //     id: newTopic.data.id,
        //     subject: selectedSubject,
        //     chapter:
        //       chapters[selectedSubject]?.find(
        //         (chap) => chap.id === selectedChapterId
        //       )?.name || "",
        //     topic: inputValue,
        //   },
        // ]);
        setInputValue("");
      })(),
      {
        loading: "Adding topic...",
        success: "Topic added successfully.",
        error: "Failed to add topic.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    await action;
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic || !inputValue || !selectedChapterId) return;

    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/topics", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingTopic.id,
            name: inputValue,
            chapter: selectedChapterId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update topic");
        }

        const updatedTopic = await response.json();
        await fetchTopics();
        // setTopics((prevTopics) =>
        //   prevTopics.map((topic) =>
        //     topic.id === editingTopic.id
        //       ? {
        //           ...topic,
        //           topic: inputValue,
        //           chapter:
        //             chapters[selectedSubject]?.find(
        //               (chap) => chap.id === selectedChapterId
        //             )?.name || "",
        //         }
        //       : topic
        //   )
        // );
        setInputValue("");
        setEditingTopic(null);
      })(),
      {
        loading: "Updating topic...",
        success: "Topic updated successfully.",
        error: "Failed to update topic.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    await action;
  };

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">Manage Topics</div>
      <div className="inputContainer">
        <div className="formGroup">
          <input
            type="text"
            id="inputField"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter topic"
          />
        </div>
        <div className="formGroup">
          <select
            id="subjects"
            value={selectedSubject}
            onChange={(e) => {
              const subject = e.target.value;
              setSelectedSubject(subject);
              setSelectedChapterId(chapters[subject]?.[0]?.id || "");
            }}
            className="selectTopics"
          >
            {loading ? (
              <option>Loading...</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="formGroup">
          <select
            id="chapters"
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="selectTopics"
          >
            {loading ? (
              <option>Loading...</option>
            ) : (
              chapters[selectedSubject]?.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))
            )}
          </select>
        </div>
        {editingTopic ? (
          <button onClick={handleUpdateTopic} className="submitButton">
            Update Topic
          </button>
        ) : (
          <button onClick={handleAddTopic} className="submitButton">
            Add Topic
          </button>
        )}
      </div>
      <div className="listContainer">
        {loading ? (
          <div>Loading...</div>
        ) : topics.length === 0 ? (
          <div className="noDataMessage">No data found</div>
        ) : (
          <ul className="todoList">
            {topics.map((topic) => (
              <li key={topic.id} className="todoItem">
                <span>
                  <span className="highlight">{topic.chapter}</span> -{" "}
                  <span className="highlight">{topic.subject}</span> :{" "}
                  {topic.topic}
                </span>
                <div className="buttonContainer">
                  <button
                    onClick={() => handleEditTopic(topic)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageTopic;
