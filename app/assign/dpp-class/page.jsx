"use client";
import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";

// Dummy data
const data = {
  dpps: [
    { id: 1, name: "Algebra Basics" },
    { id: 2, name: "Physics Mechanics" },
    { id: 3, name: "Organic Chemistry" },
    { id: 4, name: "Calculus Fundamentals" },
  ],
  classes: ["1 PUC", "2 PUC", "10th", "11th"],
  colleges: [
    { id: 1, name: "College A" },
    { id: 2, name: "College B" },
    { id: 3, name: "College C" },
  ],
};

const AssignDPPToClass = () => {
  const [selectedDPPs, setSelectedDPPs] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [assignedDPPs, setAssignedDPPs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleDPPChange = (selectedOptions) => {
    setSelectedDPPs(selectedOptions);
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
  };

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
  };

  const handleSubmit = () => {
    if (selectedDPPs.length > 0 && selectedClass && selectedCollege) {
      const newAssignment = {
        id: assignedDPPs.length + 1,
        dppNames: selectedDPPs,
        className: selectedClass,
        college: selectedCollege,
      };

      if (editIndex !== null) {
        const updatedAssignments = [...assignedDPPs];
        updatedAssignments[editIndex] = newAssignment;
        setAssignedDPPs(updatedAssignments);
        setEditIndex(null);
      } else {
        setAssignedDPPs([...assignedDPPs, newAssignment]);
      }

      // Reset the form
      setSelectedDPPs([]);
      setSelectedClass("");
      setSelectedCollege("");
    }
  };

  const handleEdit = (index) => {
    const assignment = assignedDPPs[index];
    setSelectedDPPs(assignment.dppNames);
    setSelectedClass(assignment.className);
    setSelectedCollege(assignment.college);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedAssignments = assignedDPPs.filter((_, i) => i !== index);
    setAssignedDPPs(updatedAssignments);
  };

  return (
    <div className="container">
      <div className="sectionHeader">Assign DPPs to Class and College</div>

      <div className="inputContainer">
        <MultiSelectDropDown
          options={data.dpps.map((dpp) => ({
            id: dpp.id.toString(),
            name: dpp.name,
          }))}
          selectedValues={selectedDPPs}
          onChange={handleDPPChange}
          placeholder="Select DPPs"
        />

        <SearchableSingleSelect
          options={data.classes.map((className) => ({
            id: className,
            name: className,
          }))}
          selectedValue={selectedClass}
          onChange={handleClassChange}
          placeholder="Select Class"
        />

        <SearchableSingleSelect
          options={data.colleges.map((college) => ({
            id: college.id.toString(),
            name: college.name,
          }))}
          selectedValue={selectedCollege}
          onChange={handleCollegeChange}
          placeholder="Select College"
        />

        <button onClick={handleSubmit} className="addButton">
          {editIndex !== null ? "Update" : "Assign"}
        </button>
      </div>

      <ul className="todoList">
        {assignedDPPs.map((assignment, index) => (
          <li key={assignment.id} className="todoItem">
            <span>
              {index + 1}: <strong>Class:</strong> {assignment.className} -{" "}
              <strong>College:</strong> {assignment.college} -{" "}
              <strong>DPPs:</strong> {assignment.dppNames.join(", ")}
            </span>
            <div className="buttonContainer">
              <button onClick={() => handleEdit(index)} className="editButton">
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="deleteButton"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignDPPToClass;
