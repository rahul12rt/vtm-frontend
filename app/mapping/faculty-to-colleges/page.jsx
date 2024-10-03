"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import toast, { Toaster } from "react-hot-toast";

const FacultyToCollege = () => {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [mappingOptions, setMappingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleFacultyChange = (event) => {
    setSelectedFaculty(event.target.value);
  };

  const handleCollegesChange = (values) => {
    setSelectedColleges(values);
  };

  const handleAddMapping = async () => {
    if (!selectedFaculty || selectedColleges.length === 0) {
      toast.error("Please select a faculty and at least one college.");
      return;
    }

    const payload = {
      data: {
        faculty: selectedFaculty,
        colleges: selectedColleges,
      },
    };

    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/map-faculty-college", {
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
          colleges: data.data.attributes.colleges.data.map((college) => ({
            id: college.id,
            attributes: {
              name: college.attributes.name,
            },
          })),
        };

        setMappingOptions((prev) => [...prev, newMapping]);
        setSelectedFaculty("");
        setSelectedColleges([]);
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

  const handleDeleteMapping = async (index) => {
    const mappingId = mappingOptions[index].id;

    if (!mappingId) {
      toast.error("Invalid mapping ID.");
      return;
    }

    const action = toast.promise(
      (async () => {
        const response = await fetch(`/api/map-faculty-college`, {
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
        const [facultyResponse, collegeResponse, mappingResponse] =
          await Promise.all([
            fetch("/api/register/faculty"),
            fetch("/api/colleges"),
            fetch("/api/map-faculty-college"),
          ]);

        const facultyData = await facultyResponse.json();
        const collegeData = await collegeResponse.json();
        const mappingData = await mappingResponse.json();

        setFacultyOptions(
          facultyData.data.map((faculty) => ({
            id: faculty.id,
            name: faculty.attributes.name,
          }))
        );

        setCollegeOptions(
          collegeData.data.map((college) => ({
            id: college.id,
            name: college.attributes.name,
          }))
        );

        console.log(mappingData.data);

        setMappingOptions(
          mappingData.data.map((mapping) => ({
            id: mapping.id,
            name: mapping.attributes.faculty.data.attributes.name,
            colleges: mapping.attributes.colleges.data,
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

  const handleEditMapping = (index) => {
    const selectedMapping = mappingOptions[index];
    const selectedFacultyOption = facultyOptions.find(
      (faculty) => faculty.name === selectedMapping.name
    );
    setSelectedFaculty(selectedFacultyOption.id);
    console.log(selectedMapping);
    setSelectedColleges(selectedMapping.colleges.map((college) => college.id));
    setIsEditing(true);
    setEditIndex(index);
  };

  // Add handleSaveEdit function
  const handleSaveEdit = async () => {
    if (!selectedFaculty || selectedColleges.length === 0) {
      toast.error("Please select a faculty and at least one college.");
      return;
    }

    const mappingId = mappingOptions[editIndex].id;

    const payload = {
      id: mappingId,
      data: {
        faculty: Number(selectedFaculty),
        colleges: selectedColleges,
      },
    };

    const action = toast.promise(
      (async () => {
        const response = await fetch(`/api/map-faculty-college`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error Data:", errorData);
          throw new Error("Could not update. Please try again.");
        }

        const data = await response.json();

        const updatedMapping = {
          id: data.data.id,
          name: data.data.attributes.faculty.data.attributes.name,
          colleges: data.data.attributes.colleges.data.map((college) => ({
            id: college.id,
            attributes: {
              name: college.attributes.name,
            },
          })),
        };

        setMappingOptions((prev) =>
          prev.map((item, i) => (i === editIndex ? updatedMapping : item))
        );
        setSelectedFaculty("");
        setSelectedColleges([]);
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

  return (
    <div className="container">
      <div className="sectionHeader">Faculty to College Mapping</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="inputContainer">
            <select
              value={selectedFaculty}
              onChange={handleFacultyChange}
              className="selectDropdown"
            >
              <option value="" disabled>
                Select faculty
              </option>
              {facultyOptions.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
            <MultiSelectDropDown
              options={collegeOptions}
              selectedValues={selectedColleges}
              onChange={handleCollegesChange}
              placeholder="Select colleges"
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
            {mappingOptions.map((mapping, index) => (
              <li key={mapping.id || index} className="todoItem">
                <span>
                  {index + 1}. {mapping?.name} -{" "}
                  <span className="highlight">
                    {mapping.colleges
                      .map((res) => res?.attributes?.name)
                      .join(", ")}
                  </span>
                </span>

                <div className="buttonContainer">
                  <button
                    onClick={() => handleEditMapping(index)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMapping(index)}
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

export default FacultyToCollege;
