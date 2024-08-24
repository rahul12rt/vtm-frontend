"use client";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";

// Dummy data
const data = {
  selfStudies: [
    { id: 1, name: "Algebra Basics" },
    { id: 2, name: "Advanced Geometry" },
    { id: 3, name: "Intro to Calculus" },
    { id: 4, name: "History of Rome" },
    { id: 5, name: "Shakespeare's Plays" },
  ],
  colleges: [
    { id: 1, name: "College A" },
    { id: 2, name: "College B" },
    { id: 3, name: "College C" },
  ],
};

const AssignSelfStudy = () => {
  const [selectedSelfStudies, setSelectedSelfStudies] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [assignedMaterials, setAssignedMaterials] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleSelfStudyChange = (selectedOptions) => {
    setSelectedSelfStudies(selectedOptions);
  };

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
  };

  const handleSubmit = () => {
    if (selectedSelfStudies.length > 0 && selectedCollege) {
      const newAssignment = {
        id: assignedMaterials.length + 1,
        college: selectedCollege,
        selfStudies: selectedSelfStudies,
      };

      if (editIndex !== null) {
        const updatedMaterials = [...assignedMaterials];
        updatedMaterials[editIndex] = newAssignment;
        setAssignedMaterials(updatedMaterials);
        setEditIndex(null);
      } else {
        setAssignedMaterials([...assignedMaterials, newAssignment]);
      }

      // Reset the form
      setSelectedSelfStudies([]);
      setSelectedCollege("");
    }
  };

  const handleEdit = (index) => {
    const material = assignedMaterials[index];
    setSelectedSelfStudies(material.selfStudies);
    setSelectedCollege(material.college);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedMaterials = assignedMaterials.filter((_, i) => i !== index);
    setAssignedMaterials(updatedMaterials);
  };

  return (
    <div className="container">
      <div className="sectionHeader">
        Assign Self-Study Materials to College
      </div>

      <div className="inputContainer">
        <MultiSelectDropDown
          options={data.selfStudies.map((study) => ({
            id: study.id.toString(),
            name: study.name,
          }))}
          selectedValues={selectedSelfStudies}
          onChange={handleSelfStudyChange}
          placeholder="Select Self-Studies"
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
        {assignedMaterials.map((material, index) => (
          <li key={material.id} className="todoItem">
            <span>
              {index + 1}: <strong> College:</strong> {material.college} -{" "}
              <strong>Self-Studies:</strong> {material.selfStudies.join(", ")}
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

export default AssignSelfStudy;
