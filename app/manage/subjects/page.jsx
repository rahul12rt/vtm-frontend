"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import Pagination from "../../_components/pagination";
import toast, { Toaster } from "react-hot-toast";

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
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
      toast.error("Failed to load subjects. Please try again later.", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/class", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();
      setClasses(data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes. Please try again later.", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const handleAddOrUpdateSubject = async () => {
    if (inputValue.trim() && selectedClass) {
      const payload = {
        data: {
          name: inputValue,
          class: parseInt(selectedClass, 10),
        },
      };

      if (editIndex !== null) {
        // Handle Update
        const subjectId = subjects[editIndex]?.id;

        if (!subjectId) {
          toast.error("Subject ID not found", {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
          return;
        }

        payload.data.id = subjectId;

        toast.promise(
          fetch("/api/subjects", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subjectId,
              name: inputValue,
              className: parseInt(selectedClass, 10),
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
              await fetchSubjects();
              setEditIndex(null);
              setInputValue("");
              setSelectedClass("");
              if (inputRef.current) {
                inputRef.current.focus();
              }
              return <b>Subject updated successfully!</b>;
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
        // Handle Add
        toast.promise(
          fetch("/api/subjects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
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
              await fetchSubjects();
              setInputValue("");
              setSelectedClass("");
              if (inputRef.current) {
                inputRef.current.focus();
              }
              return <b>Subject added successfully!</b>;
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
      toast.error("Please enter a subject name and select a class", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const handleEditSubject = (index) => {
    const subject = subjects[index];
    setEditIndex(index);
    setInputValue(subject.attributes.name);
    setSelectedClass(subject.attributes.class?.data?.id || "");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeleteSubject = async (index) => {
    const subjectId = subjects[index]?.id;

    if (!subjectId) {
      toast.error("Subject ID not found", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    try {
      const response = await fetch(`/api/subjects`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjectId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete subject");
      }

      await fetchSubjects();
      toast.success("Subject deleted successfully!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject. Please try again later.", {
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
      handleAddOrUpdateSubject();
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, subjects.length);
  const displayedSubjects = subjects.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="sectionHeader">Manage Subjects</div>
      <div className="inputContainer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new subject"
          ref={inputRef}
        />
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="classSelect"
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.attributes.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddOrUpdateSubject}
          className={editIndex !== null ? "addButton" : "addButton"}
        >
          {editIndex !== null ? <FaSyncAlt /> : <FaPlus />}
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <>
          <ul className="todoList">
            {displayedSubjects.map((subject, index) => (
              <li key={subject.id || index} className="todoItem">
                <span>
                  {startIndex + index + 1}. {subject?.attributes?.name} - Class:{" "}
                  {subject?.attributes?.class?.data?.attributes?.name || "N/A"}
                </span>
                <div className="buttonContainer">
                  <button
                    onClick={() => handleEditSubject(index)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(index)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={subjects.length}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Subject;
