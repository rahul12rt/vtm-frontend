"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import Pagination from "../../_components/pagination";
import styles from "../../styles/manage.module.css";
import toast, { Toaster } from "react-hot-toast";

const Chapters = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [subjects, setSubjects] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchSubjects();
    fetchChapters();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await fetch("/api/subjects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }

      const data = await response.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to load subjects. Please try again later.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const response = await fetch("/api/chapter", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chapters");
      }

      const data = await response.json();
      setTodos(data.data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError("Failed to load chapters. Please try again later.");
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleAddOrUpdateChapter = async () => {
    if (inputValue.trim() && selectedSubject) {
      const newChapter = { name: inputValue, subject: selectedSubject };

      if (editIndex !== null) {
        const chapterId = todos[editIndex]?.id;

        if (!chapterId) {
          toast.error("Chapter ID not found", {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
          return;
        }

        toast.promise(
          fetch(`/api/chapter`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chapterId,
              name: inputValue,
              subject: selectedSubject,
            }),
          }).then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.error || "An error occurred");
              });
            }
            return response.json();
          }),
          {
            loading: "Updating...",
            success: async () => {
              const updatedTodos = todos.map((todo, index) =>
                index === editIndex
                  ? {
                      ...todo,
                      attributes: {
                        ...todo.attributes,
                        name: inputValue,
                        subject: { data: { id: selectedSubject } },
                      },
                    }
                  : todo
              );
              setTodos(updatedTodos);
              setEditIndex(null);
              setInputValue("");
              setSelectedSubject("");
              fetchChapters();
              if (inputRef.current) {
                inputRef.current.focus();
              }
              return <b>Chapter updated successfully!</b>;
            },
            error: <b>Could not update. Please try again.</b>,
          },
          {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );
      } else {
        toast.promise(
          fetch(`/api/chapter`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: newChapter }),
          }).then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.error || "An error occurred");
              });
            }
            return response.json();
          }),
          {
            loading: "Saving...",
            success: async () => {
              setTodos([...todos, newChapter]);
              setInputValue("");
              setSelectedSubject("");
              fetchChapters();
              if (inputRef.current) {
                inputRef.current.focus();
              }
              return <b>Chapter added successfully!</b>;
            },
            error: <b>Could not save. Please try again.</b>,
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
    } else {
      toast.error("Please enter chapter name and select a subject", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const handleEditTodo = (index) => {
    const todo = filteredTodos[index];
    const originalIndex = todos.findIndex((t) => t.id === todo.id); // Find the original index in the todos array
    setEditIndex(originalIndex);
    setInputValue(todo.attributes.name); // Set the name correctly
    setSelectedSubject(todo.attributes.subject?.data?.id || ""); // Set the subject id if available
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeleteTodo = async (index) => {
    const chapterId = filteredTodos[index]?.id;

    if (!chapterId) {
      toast.error("Chapter ID not found", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    try {
      await fetch(`/api/chapter`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chapterId }), // Send chapterId in the request body
      });

      // Update the UI
      const updatedTodos = todos.filter((_, i) => i !== index);
      setTodos(updatedTodos);

      // Adjust pagination if needed
      const totalItems = updatedTodos.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }

      toast.success("Chapter deleted successfully!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter. Please try again later.", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddOrUpdateChapter();
    }
  };

  const filteredTodos = filterSubject
    ? todos.filter((todo) => todo.subject === filterSubject)
    : todos;

  const uniqueSubjects = Array.from(
    new Set(filteredTodos.map((todo) => todo.subject))
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTodos.length);
  const displayedTodos = filteredTodos.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="sectionHeader">Manage Chapters</div>
      <div className="inputContainer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new chapter"
          ref={inputRef}
        />
        <button onClick={handleAddOrUpdateChapter} className="addButton">
          {editIndex !== null ? <FaSyncAlt /> : <FaPlus />}
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      {error && <div className="errorText">{error}</div>}
      <div className="formGroup">
        <div>
          <select
            id="subjects"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="select"
            disabled={loadingSubjects} // Disable the select while loading
          >
            <option value="">Select Subject</option>
            {loadingSubjects ? (
              <option value="" disabled>
                Loading...
              </option>
            ) : (
              subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.attributes?.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
      {loadingChapters ? (
        <div className="loadingText">Loading...</div>
      ) : (
        <>
          {uniqueSubjects.length > 1 && (
            <div className="formGroup">
              <div>
                <label htmlFor="filter">Filter by Subject:</label>
                <select
                  id="filter"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="select"
                  style={{ marginTop: 4, width: "100%" }}
                >
                  <option value="">All</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <ul className="todoList">
            {displayedTodos.map((todo, index) => (
              <li key={index} className="todoItem">
                <span>
                  <span className={styles.chapter}>
                    {startIndex + index + 1}.{" "}
                    <span className="highlight">{todo?.attributes?.name}</span>{" "}
                    - {todo?.attributes?.subject?.data?.attributes?.name}
                  </span>
                </span>
                <div className="buttonContainer">
                  <button
                    onClick={() => handleEditTodo(startIndex + index)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(startIndex + index)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            totalItems={filteredTodos.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Chapters;
