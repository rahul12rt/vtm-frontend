"use client";
import React, { useState } from "react";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";
import { FaEdit, FaPlus, FaSyncAlt, FaTrash } from "react-icons/fa";
import Pagination from "../../_components/pagination";

const colleges = [
  { id: "1", name: "Harvard" },
  { id: "2", name: "MIT" },
  { id: "3", name: "Stanford" },
  { id: "4", name: "Oxford" },
]; // Example colleges

const facultyOptions = [
  { id: "1", name: "Dr. Smith" },
  { id: "2", name: "Prof. Johnson" },
  { id: "3", name: "Ms. Davis" },
  { id: "4", name: "Mr. Brown" },
]; // Example faculty

const FacultyToColleges = () => {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFacultyChange = (value) => {
    setSelectedFaculty(value);
  };

  const handleCollegesChange = (values) => {
    setSelectedColleges(values);
  };

  const handleSubmit = () => {
    if (selectedFaculty && selectedColleges.length > 0) {
      if (editingIndex !== null) {
        const updatedAssignments = [...assignments];
        updatedAssignments[editingIndex] = {
          facultyName: selectedFaculty,
          colleges: selectedColleges,
        };
        setAssignments(updatedAssignments);
        setEditingIndex(null);
      } else {
        setAssignments((prevAssignments) => [
          ...prevAssignments,
          { facultyName: selectedFaculty, colleges: selectedColleges },
        ]);
      }
      setSelectedFaculty("");
      setSelectedColleges([]);
    }
  };

  const handleEditAssignment = (index) => {
    const assignment = assignments[index];
    setSelectedFaculty(assignment.facultyName);
    setSelectedColleges(assignment.colleges);
    setEditingIndex(index);
  };

  const handleDeleteAssignment = (index) => {
    const actualIndex = index;
    setAssignments((prevAssignments) => {
      const newAssignments = prevAssignments.filter(
        (_, i) => i !== actualIndex
      );
      const totalPages = Math.ceil(newAssignments.length / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages); // Adjust current page if needed
      }
      return newAssignments;
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredAssignments.length
  );
  const displayedAssignments = filteredAssignments.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="sectionHeader">Faculty to College Mapping</div>
      <div className="inputContainer">
        <SearchableSingleSelect
          options={facultyOptions}
          selectedValue={selectedFaculty}
          onChange={handleFacultyChange}
          placeholder="Select faculty"
        />
        <MultiSelectDropDown
          options={colleges}
          selectedValues={selectedColleges}
          onChange={handleCollegesChange}
          placeholder="Select colleges"
        />
        <button onClick={handleSubmit} className="addButton">
          {editingIndex !== null ? <FaSyncAlt /> : <FaPlus />}
          {editingIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      <div className="inputContainer">
        {assignments.length > 1 && (
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search faculty"
            className="searchBar"
          />
        )}
      </div>
      <ul className="todoList">
        {filteredAssignments.length === 0 ? (
          searchTerm ? (
            <div className="noDataMessage">No data found</div>
          ) : null
        ) : (
          displayedAssignments.map((assignment, index) => (
            <li key={startIndex + index} className="todoItem">
              <span>
                {startIndex + index + 1}. <span>{assignment.facultyName}</span>{" "}
                -{" "}
                <span className="highlight">
                  {assignment.colleges.join(", ")}
                </span>
              </span>
              <div className="buttonContainer">
                <button
                  onClick={() => handleEditAssignment(startIndex + index)}
                  className="editButton"
                >
                  <FaEdit /> {/* Edit icon */}
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAssignment(startIndex + index)}
                  className="deleteButton"
                >
                  <FaTrash /> {/* Delete icon */}
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      {filteredAssignments.length > itemsPerPage && (
        <Pagination
          totalItems={filteredAssignments.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default FacultyToColleges;
