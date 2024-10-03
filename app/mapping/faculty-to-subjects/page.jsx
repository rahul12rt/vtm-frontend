"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import toast, { Toaster } from "react-hot-toast";

const FacultyToSubject = () => {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [mappingOptions, setMappingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  console.log(selectedFaculty);

  const handleFacultyChange = (event) => {
    setSelectedFaculty(event.target.value);
  };

  const handleSubjectsChange = (values) => {
    setSelectedSubjects(values);
  };

  const handleAddMapping = async () => {
    if (!selectedFaculty || selectedSubjects.length === 0) {
      toast.error("Please select a faculty and at least one subject.");
      return;
    }

    const payload = {
      data: {
        faculty: selectedFaculty,
        subjects: selectedSubjects,
      },
    };

    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/map-faculty-subject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error Data:", errorData);
          throw new Error("Could not save. Please try again.");
        }

        const data = await response.json();

        const newMapping = {
          id: data.data.id,
          name: data.data.attributes.faculty.data.attributes.name,
          subjects: data.data.attributes.subjects.data.map((subject) => ({
            id: subject.id,
            attributes: {
              name: subject.attributes.name,
            },
          })),
        };

        setMappingOptions((prev) => [...prev, newMapping]);
        setSelectedFaculty("");
        setSelectedSubjects([]);
      })(),
      {
        loading: "Adding mapping...",
        success: "Mapping added successfully!",
        error: "Could not save. Please try again.",
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

  const handleDeleteSubject = async (index) => {
    const mappingId = mappingOptions[index].id;

    if (!mappingId) {
      toast.error("Invalid mapping ID.");
      return;
    }

    const action = toast.promise(
      (async () => {
        const response = await fetch(`/api/map-faculty-subject`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: mappingId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error Data:", errorData);
          throw new Error("Could not delete. Please try again.");
        }

        setMappingOptions((prev) => prev.filter((_, i) => i !== index));
      })(),
      {
        loading: "Deleting mapping...",
        success: "Mapping deleted successfully!",
        error: "Could not delete. Please try again.",
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facultyResponse, subjectResponse, mappingResponse] =
          await Promise.all([
            fetch("/api/register/faculty"),
            fetch("/api/subjects"),
            fetch("/api/map-faculty-subject"),
          ]);

        const facultyData = await facultyResponse.json();
        const subjectData = await subjectResponse.json();
        const mappingData = await mappingResponse.json();

        setFacultyOptions(
          facultyData.data.map((faculty) => ({
            id: faculty.id,
            name: faculty.attributes.name,
          }))
        );

        setSubjectOptions(
          subjectData.data.map((subject) => ({
            id: subject.id,
            name: subject.attributes.name,
          }))
        );

        setMappingOptions(
          mappingData.data.map((mapping) => ({
            id: mapping.id,
            name: mapping.attributes.faculty.data.attributes.name,
            subjects: mapping.attributes.subjects.data,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditSubject = (index) => {
    const selectedMapping = mappingOptions[index];
    console.log("Selected Mapping:", selectedMapping);
    const selectedFacultyOption = facultyOptions.find(
      (faculty) => faculty.name === selectedMapping.name
    );

    if (selectedFacultyOption) {
      setSelectedFaculty(selectedFacultyOption.id);
    }

    setSelectedSubjects(selectedMapping.subjects.map((subject) => subject.id));
    setIsEditing(true);
    setEditIndex(index);
  };

  // Add handleSaveEdit function
  const handleSaveEdit = async () => {
    if (!selectedFaculty || selectedSubjects.length === 0) {
      toast.error("Please select a faculty and at least one subject.");
      return;
    }

    const mappingId = mappingOptions[editIndex].id;

    const payload = {
      id: mappingId,
      data: {
        faculty: Number(selectedFaculty),
        subjects: selectedSubjects,
      },
    };

    const action = toast.promise(
      (async () => {
        const response = await fetch(`/api/map-faculty-subject`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error Data:", errorData);
          // throw new Error("Could not update. Please try again.");
        }

        const data = await response.json();

        const updatedMapping = {
          id: data.data.id,
          name: data.data.attributes.faculty.data.attributes.name,
          subjects: data.data.attributes.subjects.data.map((subject) => ({
            id: subject.id,
            attributes: {
              name: subject.attributes.name,
            },
          })),
        };

        setMappingOptions((prev) =>
          prev.map((item, i) => (i === editIndex ? updatedMapping : item))
        );
        setSelectedFaculty("");
        setSelectedSubjects([]);
        setIsEditing(false);
      })(),
      {
        loading: "Saving changes...",
        success: "Mapping updated successfully!",
        error: "Could not update. Please try again.",
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

  console.log(facultyOptions);

  return (
    <div className="container">
      <div className="sectionHeader">Faculty to Subject Mapping</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="inputContainer">
            <select
              value={selectedFaculty}
              onChange={handleFacultyChange}
              className="selectInput"
            >
              <option value="" disabled>
                Select faculty
              </option>
              {facultyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <MultiSelectDropDown
              options={subjectOptions}
              selectedValues={selectedSubjects}
              onChange={handleSubjectsChange}
              placeholder="Select subjects"
            />
            <button
              onClick={isEditing ? handleSaveEdit : handleAddMapping}
              className="addButton"
            >
              {isEditing ? <FaSyncAlt /> : <FaPlus />}{" "}
              {isEditing ? "Save" : "Add"}
            </button>
          </div>
          <ul className="todoList">
            {mappingOptions.map((subject, index) => (
              <li key={subject.id || index} className="todoItem">
                <span>
                  {index + 1}. {subject?.name} -{" "}
                  <span className="highlight">
                    {subject.subjects
                      .map((res) => res?.attributes?.name)
                      .join(", ")}
                  </span>
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
        </>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default FacultyToSubject;
