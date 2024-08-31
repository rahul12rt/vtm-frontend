"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import Pagination from "../../_components/pagination";
import toast, { Toaster } from "react-hot-toast";

const Qualification = () => {
  const [qualifications, setQualifications] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    // Reset currentPage when itemsPerPage changes
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/qualification", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch qualifications");
      }

      const data = await response.json();
      setQualifications(data.data || []);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      toast.error("Failed to load qualifications. Please try again later.", {
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

  const handleAddOrUpdateQualification = async () => {
    if (inputValue.trim()) {
      const newQualification = { name: inputValue };

      try {
        let response;
        if (editIndex !== null) {
          // Update existing qualification
          const qualificationId = qualifications[editIndex]?.id;
          console.log(qualificationId);

          if (!qualificationId) {
            throw new Error("Qualification ID not found");
          }

          response = await fetch("/api/qualification", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ qualificationId, name: inputValue }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "An error occurred");
          }

          const updatedQualifications = qualifications.map(
            (qualification, index) =>
              index === editIndex
                ? { ...qualification, name: inputValue }
                : qualification
          );
          setQualifications(updatedQualifications);
          setEditIndex(null);
        } else {
          // Add new qualification
          response = await fetch("/api/qualification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: newQualification }), // Send newQualification directly
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "An error occurred");
          }

          const newQualificationData = await response.json();
          setQualifications([...qualifications, newQualificationData]);
        }

        setInputValue("");
        fetchQualifications();
        if (inputRef.current) {
          inputRef.current.focus();
        }
        toast.success(
          `Qualification ${
            editIndex !== null ? "updated" : "added"
          } successfully!`,
          {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );
      } catch (error) {
        console.error("Error handling qualification:", error);
        toast.error(
          `Could not ${
            editIndex !== null ? "update" : "save"
          }. Please try again.`,
          {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );
      }
    }
  };

  const handleEditQualification = (index) => {
    setEditIndex(index);
    setInputValue(qualifications[index]?.attributes?.name || "");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeleteQualification = async (index) => {
    const qualificationId = qualifications[index]?.id;
    console.log(qualificationId, "----");
    if (!qualificationId) {
      toast.error("Qualification ID not found", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    try {
      const response = await fetch(`/api/qualification`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qualificationId }), // Send qualificationId in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to delete qualification");
      }

      const updatedQualifications = qualifications.filter(
        (_, i) => i !== index
      );
      setQualifications(updatedQualifications);
      const totalItems = updatedQualifications.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }

      toast.success("Qualification deleted successfully!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error deleting qualification:", error);
      toast.error("Failed to delete qualification. Please try again later.", {
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
      handleAddOrUpdateQualification();
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, qualifications.length);
  const displayedQualifications = qualifications.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="sectionHeader">Manage Qualifications</div>
      <div className="inputContainer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new qualification"
          ref={inputRef}
        />
        <button
          onClick={handleAddOrUpdateQualification}
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
            {displayedQualifications.map((qualification, index) => (
              <li key={qualification.id || index} className="todoItem">
                <span>
                  {console.log(qualification)}
                  {startIndex + index + 1}. {qualification?.attributes?.name}
                </span>
                <div className="buttonContainer">
                  <button
                    onClick={() => handleEditQualification(startIndex + index)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteQualification(startIndex + index)
                    }
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
            totalItems={qualifications.length}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Qualification;
